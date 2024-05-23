import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { tokenPairState } from '@/auth/states/tokenPairState';
import { chromeExtensionIdState } from '@/client-config/states/chromeExtensionIdState';

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
  const chromeExtensionId = useRecoilValue(chromeExtensionIdState);

  useEffect(() => {
    if (isInFrame()) {
      const handleWindowEvents = (event: MessageEvent<any>) => {
        if (event.origin === `chrome-extension://${chromeExtensionId}`) {
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
        `chrome-extension://${chromeExtensionId}`,
      );
      window.addEventListener('message', handleWindowEvents);
      return () => {
        window.removeEventListener('message', handleWindowEvents);
      };
    }
  }, [chromeExtensionId, setTokenPair, navigate]);

  return <></>;
};
