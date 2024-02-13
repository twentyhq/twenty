import handleQueryParams from '../utils/handleQueryParams';
import requestDb from '../utils/requestDb';
import createNewButton from './createButton';
import extractFirstAndLastName from './utils/extractFirstAndLastName';

function insertButtonForPerson(): void {
  // Select the element in which to create the button.
  const parentDiv: HTMLDivElement | null = document.querySelector(
    '.pv-top-card-v2-ctas',
  );

  // Create the button with desired callback funciton to execute upon click.
  if (parentDiv) {
    const newButtonPerson: HTMLButtonElement = createNewButton(
      'Add to Twenty',
      async () => {
        // Extract person-specific data from the DOM.
        const personNameElement = document.querySelector(
          '.text-heading-xlarge',
        );

        const separatorElement = document.querySelector(
          '.pv-text-details__separator',
        );
        const personCityElement = separatorElement?.previousElementSibling;

        const profilePictureElement = document.querySelector(
          '.pv-top-card-profile-picture__image',
        );

        const firstListItem = document.querySelector(
          'div[data-view-name="profile-component-entity"]',
        );
        const secondDivElement =
          firstListItem?.querySelector('div:nth-child(2)');
        const ariaHiddenSpan = secondDivElement?.querySelector(
          'span[aria-hidden="true"]',
        );

        // Get the text content or other necessary data from the DOM elements.
        const personName = personNameElement
          ? personNameElement.textContent
          : '';
        const personCity = personCityElement
          ? personCityElement.textContent
              ?.trim()
              .replace(/\s+/g, ' ')
              .split(',')[0]
          : '';
        const profilePicture = profilePictureElement
          ? profilePictureElement?.getAttribute('src')
          : '';
        const jobTitle = ariaHiddenSpan
          ? ariaHiddenSpan.textContent?.trim()
          : '';

        const { firstName, lastName } = extractFirstAndLastName(
          String(personName),
        );

        // Prepare person data to send to the backend.
        const personData = {
          name: { firstName, lastName },
          city: personCity,
          avatarUrl: profilePicture,
          jobTitle,
          linkedinLink: { url: '', label: '' },
        };

        // Extract active tab url using chrome API - an event is triggered here and is caught by background script.
        let { url: activeTabUrl } = await chrome.runtime.sendMessage({
          action: 'getActiveTabUrl',
        });

        // Remove last slash from the URL for consistency when saving usernames.
        if (activeTabUrl.endsWith('/')) {
          activeTabUrl = activeTabUrl.slice(0, -1);
        }

        personData.linkedinLink = { url: activeTabUrl, label: activeTabUrl };

        const query = `mutation CreateOnePerson { createPerson(data:{${handleQueryParams(
          personData,
        )}}) {id} }`;

        const response = await requestDb(query);

        if (response.data) {
          newButtonPerson.textContent = 'Saved';
          newButtonPerson.setAttribute('disabled', 'true');

          // Button specific styles once the button is unclickable after successfully sending data to server.
          newButtonPerson.addEventListener('mouseenter', () => {
            const hoverStyles = {
              backgroundColor: 'black',
              borderColor: 'black',
              cursor: 'default',
            };
            Object.assign(newButtonPerson.style, hoverStyles);
          });
        } else {
          newButtonPerson.textContent = 'Try Again';
        }
      },
    );

    // Include the button in the DOM.
    parentDiv.prepend(newButtonPerson);

    // Write button specific styles here - common ones can be found in createButton.ts.
    const buttonSpecificStyles = {
      marginRight: '0.5em',
    };

    Object.assign(newButtonPerson.style, buttonSpecificStyles);
  }
}

export default insertButtonForPerson;
