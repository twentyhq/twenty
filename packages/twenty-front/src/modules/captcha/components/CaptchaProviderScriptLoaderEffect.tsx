import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { getCaptchaUrlByProvider } from '@/captcha/utils/getCaptchaUrlByProvider';
import { captchaState } from '@/client-config/states/captchaState';
import { CaptchaDriverType } from '~/generated/graphql';

export const CaptchaProviderScriptLoaderEffect = () => {
  const captcha = useRecoilValue(captchaState);
  const setIsCaptchaScriptLoaded = useSetRecoilState(
    isCaptchaScriptLoadedState,
  );

  useEffect(() => {
    if (!captcha?.provider || !captcha.siteKey) {
      return;
    }

    const scriptUrl = getCaptchaUrlByProvider(
      captcha.provider,
      captcha.siteKey,
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
        if (captcha.provider === CaptchaDriverType.GoogleRecaptcha) {
          window.grecaptcha?.ready(() => {
            setIsCaptchaScriptLoaded(true);
          });
        } else {
          setIsCaptchaScriptLoaded(true);
        }
      };
      document.body.appendChild(scriptElement);
    }
  }, [captcha?.provider, captcha?.siteKey, setIsCaptchaScriptLoaded]);

  return <></>;
};
