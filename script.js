document.addEventListener("DOMContentLoaded", () => {
    const puzzles = [
        { id: 'puzzle1', image: 'imagenes/20230822_192832.jpg' },
        { id: 'puzzle2', image: 'imagenes/20231013_072700.jpg' },
        { id: 'puzzle3', image: 'imagenes/IMG-20230919-WA0088.jpg' },
        { id: 'puzzle4', image: 'imagenes/IMG-20231231-WA0017.jpg' },
        { id: 'puzzle5', image: 'imagenes/20240622_194532.jpg' },
        { id: 'puzzle6', image: 'imagenes/IMG-20240525-WA0002.jpg' }
    ];

    puzzles.forEach(puzzle => {
        createPuzzle(puzzle.id, puzzle.image);
    });

    window.resetPuzzle = function resetPuzzle(puzzleId) {
        const puzzleContainer = document.getElementById(puzzleId);
        const pieces = Array.from(puzzleContainer.children);

        pieces.forEach(piece => {
            piece.remove(); // Eliminar todas las piezas del rompecabezas
        });

        createPuzzle(puzzleId, puzzles.find(puzzle => puzzle.id === puzzleId).image); // Volver a crear el rompecabezas
        removeCompletionIndicator(puzzleContainer); // Eliminar el indicador de completado si existe
    };

    function createPuzzle(puzzleId, image) {
        const puzzleContainer = document.getElementById(puzzleId);
        let pieces = [];

        for (let i = 0; i < 20; i++) {
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.id = `${puzzleId}-piece${i + 1}`;
            piece.style.backgroundImage = `url(${image})`;
            piece.style.backgroundPosition = `${(i % 4) * -100}px ${Math.floor(i / 4) * -100}px`;
            piece.draggable = true;
            pieces.push(piece);
        }

        shuffleArray(pieces); // Mezclar las piezas
        pieces.forEach(piece => puzzleContainer.appendChild(piece)); // Agregar las piezas al contenedor

        pieces.forEach(piece => {
            piece.addEventListener("dragstart", dragStart);
            piece.addEventListener("dragover", dragOver);
            piece.addEventListener("drop", drop);
            piece.addEventListener("dragend", dragEnd);

            // Agregar eventos táctiles
            piece.addEventListener("touchstart", touchStart);
            piece.addEventListener("touchmove", touchMove);
            piece.addEventListener("touchend", touchEnd);
        });
    }

    function dragStart(e) {
        e.dataTransfer.setData("text/plain", e.target.id);
        setTimeout(() => {
            e.target.classList.add("hide");
        }, 0);
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function drop(e) {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        const draggableElement = document.getElementById(id);
        const dropzone = e.target;

        if (dropzone !== draggableElement && dropzone.classList.contains("puzzle-piece")) {
            const parent = dropzone.parentNode;
            const temp = document.createElement('div');
            parent.replaceChild(temp, dropzone);
            parent.replaceChild(dropzone, draggableElement);
            parent.replaceChild(draggableElement, temp);
        }

        draggableElement.classList.remove("hide");

        checkCompletion(dropzone.parentNode);
    }

    function dragEnd(e) {
        e.target.classList.remove("hide");
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function checkCompletion(puzzleContainer) {
        const pieces = Array.from(puzzleContainer.children);
        let isComplete = true;

        pieces.forEach((piece, index) => {
            const pieceIndex = parseInt(piece.id.split('-piece')[1]) - 1;
            if (pieceIndex !== index) {
                isComplete = false;
            }
        });

        if (isComplete) {
            showCompletionIndicator(puzzleContainer);
            playCompletionSound(); // Llamar a la función para reproducir el sonido de completado
        } else {
            removeCompletionIndicator(puzzleContainer);
        }
    }

    function showCompletionIndicator(puzzleContainer) {
        let completionIndicator = puzzleContainer.querySelector('.completion-indicator');
        if (!completionIndicator) {
            completionIndicator = document.createElement('div');
            completionIndicator.classList.add('completion-indicator');
            const img = document.createElement('img');
            img.src = 'imagenes/pngwing.com (4).png'; // Ruta relativa a la imagen de completado
            completionIndicator.appendChild(img);
            puzzleContainer.appendChild(completionIndicator);
        }
    }

    function removeCompletionIndicator(puzzleContainer) {
        const existingIndicator = puzzleContainer.querySelector('.completion-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
    }

    function playCompletionSound() {
        const audio = new Audio('sonidos/spiderman-ringtones-old.mp3'); // Ruta relativa al archivo de sonido de completado
        audio.play();
    }

    // Funciones para manejar eventos táctiles
    function touchStart(e) {
        const touch = e.touches[0];
        this.initialX = touch.clientX - this.offsetLeft;
        this.initialY = touch.clientY - this.offsetTop;
    }

    function touchMove(e) {
        const touch = e.touches[0];
        this.style.left = `${touch.clientX - this.initialX}px`;
        this.style.top = `${touch.clientY - this.initialY}px`;
    }

    function touchEnd(e) {
        const dropzone = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);

        if (dropzone !== this && dropzone.classList.contains("puzzle-piece")) {
            const parent = dropzone.parentNode;
            const temp = document.createElement('div');
            parent.replaceChild(temp, dropzone);
            parent.replaceChild(dropzone, this);
            parent.replaceChild(this, temp);
        }

        checkCompletion(this.parentNode);
    }
});
