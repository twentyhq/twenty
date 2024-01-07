import insertButtonForPerson from './extractPersonProfile';
import insertButtonForCompany from './extractCompanyProfile';

insertButtonForCompany();
insertButtonForPerson();

// Execute the insertion of the buttons when the content script loads
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === 'executeContentScript') {
    insertButtonForCompany();
    insertButtonForPerson();
  }

  sendResponse('Executing!');
});
