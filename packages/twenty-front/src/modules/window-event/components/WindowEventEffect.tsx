import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { tokenPairState } from '@/auth/states/tokenPairState';
import { chromeExtensionIdState } from '@/client-config/states/chromeExtensionIdState';
import { isLoadingTokensFromExtensionState } from '@/window-event/states/isLoadingTokensFromExtensionState';
import { isInFrame } from '~/utils/isInIframe';
import { isDefined } from '~/utils/isDefined';

export const WindowEventEffect = () => {
  const navigate = useNavigate();
  const setTokenPair = useSetRecoilState(tokenPairState);
  const chromeExtensionId = useRecoilValue(chromeExtensionIdState);
  const setIsLoadingTokensFromExtension = useSetRecoilState(
    isLoadingTokensFromExtensionState,
  );

  useEffect(() => {
    if (isInFrame() && isDefined(chromeExtensionId)) {
      window.parent.postMessage(
        'loaded',
        `chrome-extension://${chromeExtensionId}`,
      );

      const handleWindowEvents = (event: MessageEvent<any>) => {
        if (event.origin === `chrome-extension://${chromeExtensionId}`) {
          switch (event.data.type) {
            case 'tokens': {
              setTokenPair(event.data.value);
              setIsLoadingTokensFromExtension(true);
              break;
            }
            case 'navigate':
              navigate(event.data.value);
              break;
            default:
              break;
          }
        } else {
          setIsLoadingTokensFromExtension(false);
          return;
        }
      };
      window.addEventListener('message', handleWindowEvents);
      return () => {
        window.removeEventListener('message', handleWindowEvents);
      };
    }
  }, [
    chromeExtensionId,
    setIsLoadingTokensFromExtension,
    setTokenPair,
    navigate,
  ]);

  return <></>;
};
