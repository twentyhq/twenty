import { useEffect, useState } from 'react';

const Routes = () => {
  const [currentUrl, setCurrentUrl] = useState('');

  const handleCurrentTabChange = (message: any) => {
    if (message.action === 'URL_CHANGE') {
      setCurrentUrl(message.url);
    }
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleCurrentTabChange);

    return () => {
      chrome.runtime.onMessage.removeListener(handleCurrentTabChange);
    };
  }, []);

  useEffect(() => {
    const getCurrentUrl = async () => {
      const { url } = await chrome.runtime.sendMessage({
        action: 'getActiveTabUrl',
      });
      setCurrentUrl(url);
    };

    void getCurrentUrl();
  }, []);

  switch (true) {
    case /^https?:\/\/(?:www\.)?linkedin\.com\/company(?:\/\S+)?/.test(
      currentUrl,
    ):
      return <>Company!!</>;
    case /^https?:\/\/(?:www\.)?linkedin\.com\/in(?:\/\S+)?/.test(currentUrl):
      return <>Person!!</>;
    default:
      break;
  }
};

export default Routes;
