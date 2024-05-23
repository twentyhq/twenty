import { isDefined } from '~/utils/isDefined';

const changeSidePanelUrl = async (url: string) => {
  if (isDefined(url)) {
    chrome.storage.local.set({ sidepanelUrl: url });
  }
};

export default changeSidePanelUrl;
