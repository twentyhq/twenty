import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { tokenPairState } from '@/auth/states/tokenPairState';
import { REACT_APP_CHROME_EXTENSION_ID } from '~/config';

const isInFrame = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

export const WindowEventEffect = () => {
  const navigate = useNavigate();
  const setTokenPair = useSetRecoilState(tokenPairState);

  useEffect(() => {
    if (isInFrame()) {
      const handleWindowEvents = (event: MessageEvent<any>) => {
        if (
          event.origin === `chrome-extension://${REACT_APP_CHROME_EXTENSION_ID}`
        ) {
          switch (event.data.type) {
            case 'tokens':
              setTokenPair(event.data.value);
              break;
            case 'navigate':
              navigate(event.data.value);
              break;
            default:
              break;
          }
        }
      };
      window.parent.postMessage(
        'loaded',
        `chrome-extension://${REACT_APP_CHROME_EXTENSION_ID}`,
      );
      window.addEventListener('message', handleWindowEvents);
      return () => {
        window.removeEventListener('message', handleWindowEvents);
      };
    }
  }, [setTokenPair, navigate]);

  return <></>;
};
