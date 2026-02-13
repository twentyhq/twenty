import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { tokenPairState } from '@/auth/states/tokenPairState';
import { isLoadingTokensFromExtensionState } from '@/chrome-extension-sidecar/states/isLoadingTokensFromExtensionState';
import { chromeExtensionIdState } from '@/client-config/states/chromeExtensionIdState';
import { isInFrame } from '~/utils/isInIframe';
import { isDefined } from 'twenty-shared/utils';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const ChromeExtensionSidecarEffect = () => {
  const navigate = useNavigate();
  const setTokenPair = useSetRecoilState(tokenPairState);
  const chromeExtensionId = useRecoilValueV2(chromeExtensionIdState);
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
