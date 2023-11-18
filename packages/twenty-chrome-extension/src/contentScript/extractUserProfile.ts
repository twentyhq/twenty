import createNewButton from './createButton';

function insertButtonForUser(): void {
  const parentDiv: HTMLDivElement | null = document.querySelector('.pv-top-card-v2-ctas');

  if (parentDiv) {
    const newButtonUser: HTMLButtonElement = createNewButton('Add to Twenty', () => {
      // Extract user-specific data from the DOM.
      const userNameElement = document.querySelector('.text-heading-xlarge');

      const separatorElement = document.querySelector('.pv-text-details__separator');
      const userCityElement = separatorElement?.previousElementSibling;

      const profilePictureElement = document.querySelector('.pv-top-card-profile-picture__image');

      const firstListItem = document.querySelector('div[data-view-name="profile-component-entity"]');
      const secondDivElement = firstListItem?.querySelector('div:nth-child(2)');
      const ariaHiddenSpan = secondDivElement?.querySelector('span[aria-hidden="true"]');

      // Get the text content or other necessary data from the DOM elements.
      const userName = userNameElement ? userNameElement.textContent : '';
      const userCity = userCityElement ? userCityElement.textContent?.trim().replace(/\s+/g, ' ') : '';
      const profilePicture = profilePictureElement ? profilePictureElement?.getAttribute('src') : '';
      const jobTitle = ariaHiddenSpan ? ariaHiddenSpan.textContent?.trim() : '';

      // Prepare user data to send to the backend.
      const userData = {
        name: userName,
        city: userCity,
        picture: profilePicture,
        jobTitle,
        linkedInUrl: '',
      };

      chrome.runtime.sendMessage({ message: 'getActiveTabUrl' }, (response) => {
        if (response && response.url) {
          const activeTabUrl: string = response.url;
          userData.linkedInUrl = activeTabUrl;
        }
      });

      // Simulate backend call with user data.
      setTimeout(() => {
        console.log('Sending data to the backend for user:', userData);
        newButtonUser.textContent = 'Saved';
      }, 2000);
    });

    parentDiv.prepend(newButtonUser);
    const buttonSpecificStyles = {
      marginRight: '0.5em',
    };

    Object.assign(newButtonUser.style, buttonSpecificStyles);
  }
}

export default insertButtonForUser;
