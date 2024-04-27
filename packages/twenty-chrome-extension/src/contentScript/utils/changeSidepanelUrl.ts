import { isDefined } from '~/utils/isDefined';

const changeSidePanelUrl = async (url: string) => {
  const { tab: activeTab } = await chrome.runtime.sendMessage({
    action: 'getActiveTab',
  });
  if (isDefined(activeTab) && isDefined(url)) {
    chrome.storage.local.set({ [`sidepanelUrl_${activeTab.id}`]: url });
    chrome.runtime.sendMessage({
      action: 'changeSidepanelUrl',
      message: { url },
    });
  }
};

export default changeSidePanelUrl;
