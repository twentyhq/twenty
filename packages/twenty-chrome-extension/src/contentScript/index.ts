import insertButtonForUser from './extractUserProfile';
import insertButtonForCompany from './extractCompanyProfile';

insertButtonForCompany();
insertButtonForUser();

// Execute the insertion of the buttons when the content script loads
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === 'executeContentScript') {
    insertButtonForCompany();
    insertButtonForUser();
  }

  sendResponse('Executing!');
});
