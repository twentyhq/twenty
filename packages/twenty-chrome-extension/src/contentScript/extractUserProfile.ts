import handleQueryParams from '../utils/handleQueryParams';
import requestDb from '../utils/requestDb';
import createNewButton from './createButton';
import extractFirstAndLastName from './utils/extractFirstAndLastName';

function insertButtonForUser(): void {
  const parentDiv: HTMLDivElement | null = document.querySelector('.pv-top-card-v2-ctas');

  if (parentDiv) {
    const newButtonUser: HTMLButtonElement = createNewButton('Add to Twenty', async () => {
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
      const userCity = userCityElement ? userCityElement.textContent?.trim().replace(/\s+/g, ' ').split(',')[0] : '';
      const profilePicture = profilePictureElement ? profilePictureElement?.getAttribute('src') : '';
      const jobTitle = ariaHiddenSpan ? ariaHiddenSpan.textContent?.trim() : '';

      const { firstName, lastName } = extractFirstAndLastName(String(userName));

      // Prepare user data to send to the backend.
      const userData = {
        name: { firstName, lastName },
        city: userCity,
        avatarUrl: profilePicture,
        jobTitle,
        linkedinLink: { url: '', label: '' },
      };

      const { url: activeTabUrl } = await chrome.runtime.sendMessage({ action: 'getActiveTabUrl' });
      userData.linkedinLink = { url: activeTabUrl, label: activeTabUrl };

      const query = `mutation CreateOnePerson { createPerson(data:{${handleQueryParams(userData)}}) {id} }`;

      const response = await requestDb(query);

      if (response.data) {
        newButtonUser.textContent = 'Saved';
        newButtonUser.setAttribute('disabled', 'true');

        newButtonUser.addEventListener('mouseenter', () => {
          const hoverStyles = {
            backgroundColor: 'black',
            borderColor: 'black',
            cursor: 'default',
          };
          Object.assign(newButtonUser.style, hoverStyles);
        });
      } else {
        newButtonUser.textContent = 'Try Again';
      }
    });

    parentDiv.prepend(newButtonUser);
    const buttonSpecificStyles = {
      marginRight: '0.5em',
    };

    Object.assign(newButtonUser.style, buttonSpecificStyles);
  }
}

export default insertButtonForUser;
