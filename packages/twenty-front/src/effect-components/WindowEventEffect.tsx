import { useCallback, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { tokenPairState } from '@/auth/states/tokenPairState';
import { REACT_APP_CHROME_EXTENSION_ID } from '~/config';
import { useNavigate } from 'react-router-dom';

export const WindowEventEffect = () => {
  const navigate = useNavigate();
  const setTokenPair = useSetRecoilState(tokenPairState);

  const inIframe = useCallback(() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }, []);

  useEffect(() => {
    if (inIframe()) {
      const handleWindowEvents = (event: MessageEvent<any>) => {
        if (
          event.origin === `chrome-extension://${REACT_APP_CHROME_EXTENSION_ID}`
        ) {
          switch (event.data.type) {
            case "tokens":
              setTokenPair(event.data.value);
              break;
            case "navigate":
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
  }, [setTokenPair, inIframe]);

  return <></>;
};
