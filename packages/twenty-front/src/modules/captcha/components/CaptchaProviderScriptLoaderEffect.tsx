import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { getCaptchaUrlByProvider } from '@/captcha/utils/getCaptchaUrlByProvider';
import { captchaProviderState } from '@/client-config/states/captchaProviderState';
import { CaptchaDriverType } from '~/generated/graphql';

export const CaptchaProviderScriptLoaderEffect = () => {
  const captchaProvider = useRecoilValue(captchaProviderState);
  const setIsCaptchaScriptLoaded = useSetRecoilState(
    isCaptchaScriptLoadedState,
  );

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
        if (captchaProvider.provider === CaptchaDriverType.GoogleRecaptcha) {
          window.grecaptcha?.ready(() => {
            setIsCaptchaScriptLoaded(true);
          });
        } else {
          setIsCaptchaScriptLoaded(true);
        }
      };
      document.body.appendChild(scriptElement);
    }
  }, [
    captchaProvider?.provider,
    captchaProvider?.siteKey,
    setIsCaptchaScriptLoaded,
  ]);

  return <></>;
};
