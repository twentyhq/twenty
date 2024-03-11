import { useEffect, useState } from 'react';

import Routes from '~/modules/routes';
import Options from '~/options/Options';

const App = () => {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const getTokenState = async () => {
      const apiKey = await chrome.storage.local.get(['apiKey']);
      if (apiKey) {
        setIsVerified(true);
      }
    };

    void getTokenState();
  }, []);

  return <>{isVerified ? <Routes /> : <Options />}</>;
};

export default App;
