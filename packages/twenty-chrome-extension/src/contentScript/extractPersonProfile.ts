import { createDefaultButton } from '~/contentScript/createButton';
import extractFirstAndLastName from '~/contentScript/utils/extractFirstAndLastName';
import { createPerson, fetchPerson } from '~/db/person.db';
import { PersonInput } from '~/db/types/person.types';
import { isDefined } from '~/utils/isDefined';

export const checkIfPersonExists = async () => {
  const { tab: activeTab } = await chrome.runtime.sendMessage({
    action: 'getActiveTab',
  });

  let activeTabUrl = '';
  if (isDefined(activeTab.url.endsWith('/'))) {
    activeTabUrl = activeTab.url.slice(0, -1);
  }

  const personNameElement = document.querySelector('.text-heading-xlarge');
  const personName = personNameElement ? personNameElement.textContent : '';

  const { firstName, lastName } = extractFirstAndLastName(String(personName));
  const person = await fetchPerson({
    name: {
      firstName: { eq: firstName },
      lastName: { eq: lastName },
    },
    linkedinLink: { url: { eq: activeTabUrl }, label: { eq: activeTabUrl } },
  });
  return person;
};

export const addPerson = async () => {
  const personNameElement = document.querySelector('.text-heading-xlarge');

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
  const secondDivElement = firstListItem?.querySelector('div:nth-child(2)');
  const ariaHiddenSpan = secondDivElement?.querySelector(
    'span[aria-hidden="true"]',
  );

  // Get the text content or other necessary data from the DOM elements.
  const personName = personNameElement ? personNameElement.textContent : '';
  const personCity = personCityElement
    ? personCityElement.textContent?.trim().replace(/\s+/g, ' ').split(',')[0]
    : '';
  const profilePicture = profilePictureElement
    ? profilePictureElement?.getAttribute('src')
    : '';
  const jobTitle = ariaHiddenSpan ? ariaHiddenSpan.textContent?.trim() : '';

  const { firstName, lastName } = extractFirstAndLastName(String(personName));

  // Prepare person data to send to the backend.
  const personData: PersonInput = {
    name: { firstName, lastName },
    city: personCity ?? '',
    avatarUrl: profilePicture ?? '',
    jobTitle: jobTitle ?? '',
    linkedinLink: { url: '', label: '' },
  };

  // Extract active tab url using chrome API - an event is triggered here and is caught by background script.
  const { tab: activeTab } = await chrome.runtime.sendMessage({
    action: 'getActiveTab',
  });

  let activeTabUrl = '';

  // Remove last slash from the URL for consistency when saving usernames.
  if (isDefined(activeTab.url.endsWith('/'))) {
    activeTabUrl = activeTab.url.slice(0, -1);
  }

  personData.linkedinLink = { url: activeTabUrl, label: activeTabUrl };
  const person = await createPerson(personData);
  return person;
};

export const insertButtonForPerson = async () => {
  const personButtonDiv = createDefaultButton('twenty-person-btn', async () => {
    if (isDefined(personButtonDiv)) {
      const personBtnSpan = personButtonDiv.getElementsByTagName('span')[0];
      personBtnSpan.textContent = 'Saving...';
      const person = await addPerson();
      if (isDefined(person)) {
        personBtnSpan.textContent = 'Saved';
        Object.assign(personButtonDiv.style, { pointerEvents: 'none' });
      } else {
        personBtnSpan.textContent = 'Try again';
      }
    }
  });

  if (isDefined(personButtonDiv)) {
    const parentDiv: HTMLDivElement | null = document.querySelector(
      '.pv-top-card-v2-ctas',
    );

    if (isDefined(parentDiv)) {
      Object.assign(personButtonDiv.style, {
        marginRight: '.8rem',
      });
      parentDiv.prepend(personButtonDiv);
    }

    const personBtnSpan = personButtonDiv.getElementsByTagName('span')[0];
    const person = await checkIfPersonExists();
    if (isDefined(person)) {
      personBtnSpan.textContent = 'Saved';
      Object.assign(personButtonDiv.style, { pointerEvents: 'none' });
    } else {
      personBtnSpan.textContent = 'Add to Twenty';
    }
  }
};
