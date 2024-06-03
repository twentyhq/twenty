import { useEffect, useState } from 'react';

import Settings from '~/options/Settings';
import Sidepanel from '~/options/Sidepanel';
import { isDefined } from '~/utils/isDefined';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('');

  useEffect(() => {
    const setCurrentScreenState = async () => {
      const store = await chrome.storage.local.get(['navigateSidepanel']);
      if (isDefined(store.navigateSidepanel)) {
        setCurrentScreen(store.navigateSidepanel);
      }
    };

    setCurrentScreenState();
  }, []);

  useEffect(() => {
    chrome.storage.local.onChanged.addListener((updatedStore) => {
      if (
        isDefined(updatedStore.navigateSidepanel) &&
        isDefined(updatedStore.navigateSidepanel.newValue)
      ) {
        setCurrentScreen(updatedStore.navigateSidepanel.newValue);
      }
    });
  }, [setCurrentScreen]);

  switch (currentScreen) {
    case 'sidepanel':
      return <Sidepanel />;
    case 'settings':
      return <Settings />;
    default:
      return <Settings />;
  }
};

export default App;
