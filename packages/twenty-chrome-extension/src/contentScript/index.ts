import { insertButtonForCompany } from '~/contentScript/extractCompanyProfile';
import { insertButtonForPerson } from '~/contentScript/extractPersonProfile';

// Inject buttons into the DOM when SPA is reloaded on the resource url.
// e.g. reload the page when on https://www.linkedin.com/in/mabdullahabaid/
// await insertButtonForCompany();
(async () => {
  await insertButtonForCompany();
  await insertButtonForPerson();
})();

// The content script gets executed upon load, so the the content script is executed when a user visits https://www.linkedin.com/feed/.
// However, there would never be another reload in a single page application unless triggered manually.
// Therefore, if the user navigates to a person or a company page, we must manually re-execute the content script to create the "Add to Twenty" button.
// e.g. create "Add to Twenty" button when a user navigates to https://www.linkedin.com/in/mabdullahabaid/ from https://www.linkedin.com/feed/
chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
  if (message.action === 'executeContentScript') {
    await insertButtonForCompany();
    await insertButtonForPerson();
  }

  sendResponse('Executing!');
});
