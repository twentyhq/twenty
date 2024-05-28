import { isDefined } from '~/utils/isDefined';

const changeSidePanelUrl = async (url: string) => {
  if (isDefined(url)) {
    chrome.storage.local.set({ navigateSidepanel: 'sidepanel' });
    // we first clear the sidepanelUrl to trigger the onchange listener on sidepanel
    // which will pass the post meessage to handle internal navigation of iframe
    chrome.storage.local.set({ sidepanelUrl: '' });
    chrome.storage.local.set({ sidepanelUrl: url });
  }
};

export default changeSidePanelUrl;
