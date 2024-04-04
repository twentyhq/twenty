import insertButtonForCompany from '~/contentScript/extractCompanyProfile';
import insertButtonForPerson from '~/contentScript/extractPersonProfile';

// Inject buttons into the DOM when SPA is reloaded on the resource url.
// e.g. reload the page when on https://www.linkedin.com/in/mabdullahabaid/
await insertButtonForCompany();
await insertButtonForPerson();

// The content script gets executed upon load, so the the content script is executed when a user visits https://www.linkedin.com/feed/.
// However, there would never be another reload in a single page application unless triggered manually.
// Therefore, if the user navigates to a person or a company page, we must manually re-execute the content script to create the "Add to Twenty" button.
// e.g. create "Add to Twenty" button when a user navigates to https://www.linkedin.com/in/mabdullahabaid/ from https://www.linkedin.com/feed/
chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
  if (message.action === 'executeContentScript') {
    await insertButtonForCompany();
    await insertButtonForPerson();
  }

  if (message.action === 'TOGGLE') {
    toggle();
  }

  sendResponse('Executing!');
});

const createIframe = () => {
  const iframe = document.createElement('iframe');
  iframe.style.background = 'lightgrey';
  iframe.style.height = '100vh';
  iframe.style.width = '400px';
  iframe.style.position = 'fixed';
  iframe.style.top = '0px';
  iframe.style.right = '-400px';
  iframe.style.zIndex = '9000000000000000000';
  iframe.style.transition = 'ease-in-out 0.3s';
  return iframe;
};

const handleContentIframeLoadComplete = () => {
  //If the pop-out window is already open then we replace loading iframe with our content iframe
  if (loadingIframe.style.right === '0px') contentIframe.style.right = '0px';
  loadingIframe.style.display = 'none';
  contentIframe.style.display = 'block';
};

//Creating one iframe where we are loading our front end in the background
const contentIframe = createIframe();
contentIframe.style.display = 'none';
contentIframe.src = `${import.meta.env.VITE_FRONT_BASE_URL}`;
contentIframe.onload = handleContentIframeLoadComplete;

//Creating this iframe to show as a loading state until the above iframe loads completely
const loadingIframe = createIframe();
loadingIframe.src = chrome.runtime.getURL('loading.html');

document.body.appendChild(loadingIframe);
document.body.appendChild(contentIframe);

const toggleIframe = (iframe: HTMLIFrameElement) => {
  if (iframe.style.right === '-400px' && iframe.style.display !== 'none') {
    iframe.style.right = '0px';
  } else if (iframe.style.right === '0px' && iframe.style.display !== 'none') {
    iframe.style.right = '-400px';
  }
};

const toggle = () => {
  toggleIframe(loadingIframe);
  toggleIframe(contentIframe);
};
