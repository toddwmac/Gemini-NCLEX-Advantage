document.addEventListener('DOMContentLoaded', () => {
    const quizForm = document.getElementById('quiz-form');
    const numQuestionsSelect = document.getElementById('num-questions');
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    const quizSettingsSection = document.getElementById('quiz-settings');
    const quizAreaSection = document.getElementById('quiz-area');
    const questionNumberDisplay = document.getElementById('question-number');
    const currentQuestionDisplay = document.getElementById('current-question');
    const totalQuestionsDisplay = document.getElementById('total-questions');
    const questionTextDisplay = document.getElementById('question-text');
    const answerOptionsContainer = document.getElementById('answer-options');
    const nextButton = document.getElementById('next-button');
    const quizResultsSection = document.getElementById('quiz-results');
    const finalScoreDisplay = document.getElementById('final-score');
    const totalScoreDisplay = document.getElementById('total-score');
    const resultsContainer = document.getElementById('results-container');
    const restartButton = document.getElementById('restart-button');

    let questions = [];
    let currentQuestionIndex = 0;
    let selectedQuestions = [];
    let userAnswers = [];
    let score = 0;

    // Function to load questions from JSON
    async function loadQuestions() {
        try {
            const response = await fetch('questions.json');
            questions = await response.json();
        } catch (error) {
            console.error('Error loading questions:', error);
            alert('Failed to load questions. Please try again later.');
        }
    }

    // Function to start the quiz
    function startQuiz(numQuestions, selectedCategories) {
        currentQuestionIndex = 0;
        // Changed empty string resets to empty arrays
        selectedQuestions = [];
        userAnswers = [];
        score = 0;
        resultsContainer.innerHTML = ''; // Clear previous results

        let filteredQuestions ='';
        if (selectedCategories.includes('all')) {
            filteredQuestions = [...questions]; // Use all questions
        } else {
            filteredQuestions = questions.filter(q => selectedCategories.includes(q.category));
        }

        // Shuffle questions
        filteredQuestions.sort(() => Math.random() - 0.5);

        selectedQuestions = filteredQuestions.slice(0, numQuestions);
        totalQuestionsDisplay.textContent = selectedQuestions.length;

        quizSettingsSection.classList.add('hidden');
        quizAreaSection.classList.remove('hidden');
        showQuestion();
    }

    // Function to handle answer selection
    function selectAnswer(selectedOption, correctAnswer) {
        const answerButtons = document.querySelectorAll('#answer-options .answer-button');
        
        // Clear previous selection
        answerButtons.forEach(button => {
            button.classList.remove(
                'bg-blue-300', 'hover:bg-blue-400',
                'bg-red-300', 'hover:bg-red-400',
                'text-white', 'selected', 'opacity-50',
                'border-blue-500', 'border-4', 'shadow-lg'
            );
        });

        // Update user's answer for current question
        userAnswers[currentQuestionIndex] = selectedOption;

        // Style the selected answer
        answerButtons.forEach(button => {
            if (button.textContent === selectedOption) {
                button.classList.add('border-blue-500', 'border-4', 'shadow-lg');
            }
        });

        // Enable Next button
        nextButton.classList.remove('hidden');
    }

    // Update showQuestion to clear previous selection
    function showQuestion() {
        if (currentQuestionIndex < selectedQuestions.length) {
            const currentQuestion = selectedQuestions[currentQuestionIndex];
            currentQuestionDisplay.textContent = currentQuestionIndex + 1;
            questionTextDisplay.textContent = currentQuestion.question;
            answerOptionsContainer.innerHTML = ''; // Clear previous options

            // Add fade-in animation to question text
            questionTextDisplay.style.opacity = 0;
            setTimeout(() => {
                questionTextDisplay.style.opacity = 1;
                questionTextDisplay.style.transition = 'opacity 0.5s ease-in-out';
            }, 100);

            // Shuffle answer options
            const shuffledOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);

            shuffledOptions.forEach((option, index) => {
                const button = document.createElement('button');
                button.classList.add('answer-button', 'bg-gray-200', 'hover:bg-gray-300', 'text-gray-800', 'font-bold', 'py-2', 'px-4', 'rounded', 'focus:outline-none', 'focus:shadow-outline', 'w-full', 'text-left');
                button.textContent = option;
                button.addEventListener('click', () => selectAnswer(option, currentQuestion.correctAnswer));
                
                // Show existing selection if present
                if (userAnswers[currentQuestionIndex] === option) {
                    button.classList.add('border-blue-500', 'border-4', 'shadow-lg');
                }
                
                answerOptionsContainer.appendChild(button);
            });

            // Hide the "Next" button until an answer is selected
            nextButton.classList.add('hidden');
        } else {
            endQuiz();
        }
    }

    // Function to move to the next question
    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        showQuestion();
    });

    // Function to end the quiz with confetti animation
    function endQuiz() {
        quizAreaSection.classList.add('hidden');
        quizResultsSection.classList.remove('hidden');
        finalScoreDisplay.textContent = score;
        totalScoreDisplay.textContent = selectedQuestions.length;

        selectedQuestions.forEach((question, index) => {
            const resultDiv = document.createElement('div');
            resultDiv.classList.add('mb-4', 'p-4', 'rounded-md', 'shadow-sm');
            const isCorrect = userAnswers[index] === question.correctAnswer;
            resultDiv.classList.add(isCorrect ? 'bg-blue-100' : 'bg-red-100');

            const questionText = document.createElement('p');
            questionText.classList.add('font-semibold', 'mb-2');
            questionText.textContent = `Question ${index + 1}: ${question.question}`;

            const userAnswerText = document.createElement('p');
            userAnswerText.textContent = `Your Answer: ${userAnswers[index]}`;
            if (!isCorrect) {
                userAnswerText.classList.add('text-red-500', 'font-bold');
            }

            const correctAnswerText = document.createElement('p');
            correctAnswerText.textContent = `Correct Answer: ${question.correctAnswer}`;
            correctAnswerText.classList.add('text-blue-500', 'font-bold');

            const explanationText = document.createElement('p');
            explanationText.textContent = `Explanation: ${question.explanation}`;
            explanationText.classList.add('text-gray-700', 'mt-2', 'text-sm');

            resultDiv.appendChild(questionText);
            resultDiv.appendChild(userAnswerText);
            resultDiv.appendChild(correctAnswerText);
            resultDiv.appendChild(explanationText);
            resultsContainer.appendChild(resultDiv);
        });

        // Save quiz score to local storage
        saveQuizScore(score, selectedQuestions.length);

        // Trigger confetti animation
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
        });
    }

    // Event listener for quiz form submission
    quizForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const numQuestions = parseInt(numQuestionsSelect.value);
        const selectedCategories = Array.from(categoryCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        if (selectedCategories.includes('all') && categoryCheckboxes.length > 1) {
            // Uncheck individual categories if 'all' is selected
            categoryCheckboxes.forEach(checkbox => {
                if (checkbox.value !== 'all') {
                    checkbox.checked = false;
                }
            });
        } else if (!selectedCategories.includes('all') && Array.from(categoryCheckboxes).some(cb => cb.value === 'all' && cb.checked)) {
            // Uncheck 'all' if individual categories are selected
            const allCheckbox = Array.from(categoryCheckboxes).find(cb => cb.value === 'all');
            if (allCheckbox) {
                allCheckbox.checked = false;
            }
        }

        startQuiz(numQuestions, selectedCategories);
    });

    // Event listener for restart button
    restartButton.addEventListener('click', () => {
        quizResultsSection.classList.add('hidden');
        quizSettingsSection.classList.remove('hidden');
    });

    // Load questions when the page loads
    loadQuestions();

    // --- Tracking System ---
    const lastVisitedKey = 'aspenNclexLastVisited';
    const quizScoresKey = 'aspenNclexQuizScores';

    // Save last visited page
    function saveLastVisited() {
        localStorage.setItem(lastVisitedKey, window.location.pathname);
    }

    // Load last visited page
    function loadLastVisited() {
        const lastVisited = localStorage.getItem(lastVisitedKey);
        // You might want to redirect the user or display a message here
        console.log('Last visited page:', lastVisited);
    }

    // Save quiz score
    function saveQuizScore(score, total) {
        let scores = JSON.parse(localStorage.getItem(quizScoresKey)) ||'';
        scores.push({ score: score, total: total, date: new Date().toLocaleDateString() });
        localStorage.setItem(quizScoresKey, JSON.stringify(scores));
    }

    // Load quiz scores (for display on a tracking page later)
    function loadQuizScores() {
        return JSON.parse(localStorage.getItem(quizScoresKey)) ||'';
    }

    // Call saveLastVisited on page unload
    window.addEventListener('beforeunload', saveLastVisited);

    // Call loadLastVisited on page load (you might want to adjust when this is called)
    loadLastVisited();
});
