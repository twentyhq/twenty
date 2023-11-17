function createNewButton(): HTMLButtonElement {
  const newButton: HTMLButtonElement = document.createElement('button');
  newButton.textContent = 'Add to Twenty';

  const buttonStyles = {
    border: '1px solid black',
    borderRadius: '20px',
    backgroundColor: 'black',
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: '600',
    marginRight: '0.5em',
    padding: '0.45em 1em',
    width: '15rem',
  };

  // Apply styles to the button.
  Object.assign(newButton.style, buttonStyles);

  newButton.addEventListener('mouseenter', () => {
    const hoverStyles = {
      backgroundColor: '#5e5e5e',
      borderColor: '#5e5e5e',
    };
    Object.assign(newButton.style, hoverStyles);
  });

  newButton.addEventListener('mouseleave', () => {
    Object.assign(newButton.style, buttonStyles);
  });

  newButton.addEventListener('click', () => {
    newButton.textContent = 'Saving...';

    // Simulate data extraction - replace with extraction logic later.
    const extractedData = 'Data to send to backend';

    // Simulate an asynchronous process with a timeout - replace with backend call.
    setTimeout(() => {
      console.log('Sending data to the backend:', extractedData);
      newButton.textContent = 'Saved';
    }, 2000); // Simulating a 2-second delay.
  });
  return newButton;
}

function insertButtonBeforeOpenToButton(): void {
  const parentDiv: HTMLDivElement | null = document.querySelector('.pv-top-card-v2-ctas');

  if (parentDiv) {
    const newButton: HTMLButtonElement = createNewButton();
    parentDiv.prepend(newButton);
  }
}

// Execute the insertion of the button when the content script loads
insertButtonBeforeOpenToButton();
