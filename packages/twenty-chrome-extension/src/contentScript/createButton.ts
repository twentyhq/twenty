function createNewButton(text: string, onClickHandler: () => void): HTMLButtonElement {
  const newButton: HTMLButtonElement = document.createElement('button');
  newButton.textContent = text;

  const buttonStyles = {
    border: '1px solid black',
    borderRadius: '20px',
    backgroundColor: 'black',
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: '600',
    padding: '0.45em 1em',
    width: '15rem',
    height: '32px',
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

  newButton.addEventListener('click', async () => {
    const { apiKey } = await chrome.storage.local.get('apiKey');
    console.log(apiKey);

    if (!apiKey) {
      chrome.runtime.sendMessage({ action: 'openOptionsPage' });
      return;
    }

    newButton.textContent = 'Saving...';

    // Call the provided onClickHandler function to handle button click logic
    onClickHandler();
  });

  return newButton;
}

export default createNewButton;
