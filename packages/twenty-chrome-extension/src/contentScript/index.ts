import insertButtonForPerson from './extractPersonProfile';
import insertButtonForCompany from './extractCompanyProfile';

// Inject buttons into the DOM when SPA is reloaded on the resource url.
// e.g. reload the page when on https://www.linkedin.com/in/mabdullahabaid/
insertButtonForCompany();
insertButtonForPerson();

// Inject buttons into the DOM when SPA navigates to the resource from another LinkedIn page.
// e.g. navigate to https://www.linkedin.com/in/mabdullahabaid/ from https://www.linkedin.com/feed/ without reload
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === 'executeContentScript') {
    insertButtonForCompany();
    insertButtonForPerson();
  }

  sendResponse('Executing!');
});
