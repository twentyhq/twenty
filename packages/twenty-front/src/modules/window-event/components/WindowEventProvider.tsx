import { useEffect, useState } from 'react';
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

export const WindowEventProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const navigate = useNavigate();
  const setTokenPair = useSetRecoilState(tokenPairState);
  const chromeExtensionId = useRecoilValue(chromeExtensionIdState);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);

  useEffect(() => {
    if (isInFrame()) {
      window.parent.postMessage(
        'loaded',
        `chrome-extension://${chromeExtensionId}`,
      );

      const handleWindowEvents = (event: MessageEvent<any>) => {
        if (event.origin === `chrome-extension://${chromeExtensionId}`) {
          switch (event.data.type) {
            case 'tokens': {
              setTokenPair(event.data.value);
              setIsLoadingTokens(false);
              break;
            }
            case 'navigate':
              navigate(event.data.value);
              break;
            default:
              break;
          }
        }
      };
      window.addEventListener('message', handleWindowEvents);
      return () => {
        window.removeEventListener('message', handleWindowEvents);
      };
    }
  }, [chromeExtensionId, setIsLoadingTokens, setTokenPair, navigate]);

  return isInFrame() ? !isLoadingTokens && <>{children}</> : <>{children}</>;
};
