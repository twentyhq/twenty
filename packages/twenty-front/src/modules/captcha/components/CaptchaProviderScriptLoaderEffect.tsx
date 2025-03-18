import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { getCaptchaUrlByProvider } from '@/captcha/utils/getCaptchaUrlByProvider';
import { captchaState } from '@/client-config/states/captchaState';
import { CaptchaDriverType } from '~/generated/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';

export const CaptchaProviderScriptLoaderEffect = () => {
  const captcha = useRecoilValue(captchaState);
  const setIsCaptchaScriptLoaded = useSetRecoilState(
    isCaptchaScriptLoadedState,
  );
  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();

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

  useEffect(() => {
    if (
      !isUndefinedOrNull(captcha?.provider) &&
      captcha?.provider === CaptchaDriverType.GoogleRecaptcha
    ) {
      const intervalId = setInterval(() => {
        requestFreshCaptchaToken();
      }, 110 * 1000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [captcha?.provider, requestFreshCaptchaToken]);

  return <></>;
};
