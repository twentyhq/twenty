import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { captchaProviderState } from '@/client-config/states/captchaProviderState';
import { getCaptchaUrlByProvider } from '~/utils/captcha';

export const useInsertCaptchaScript = () => {
  const captchaProvider = useRecoilValue(captchaProviderState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!captchaProvider?.provider || !captchaProvider.siteKey) {
      return;
    }

    const scriptUrl = getCaptchaUrlByProvider(
      captchaProvider.provider,
      captchaProvider.siteKey,
    );
    if (!scriptUrl) {
      return;
    }

    let scriptElement: HTMLScriptElement | null = document.querySelector(
      `script[src="${scriptUrl}"]`,
    );
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.src = scriptUrl;
      scriptElement.onload = () => {
        setIsLoaded(true);
      };
      document.body.appendChild(scriptElement);
    }
  }, [captchaProvider?.provider, captchaProvider?.siteKey]);

  return isLoaded;
};
