import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { getCaptchaUrlByProvider } from '@/captcha/utils/getCaptchaUrlByProvider';
import { captchaState } from '@/client-config/states/captchaState';
import { CaptchaDriverType } from '~/generated/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const CaptchaProviderScriptLoaderEffect = () => {
  const captcha = useRecoilValue(captchaState);
  const [isCaptchaScriptLoaded, setIsCaptchaScriptLoaded] = useRecoilState(
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
        if (captcha.provider === CaptchaDriverType.GOOGLE_RECAPTCHA) {
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
    if (isUndefinedOrNull(captcha?.provider) || !isCaptchaScriptLoaded) {
      return;
    }

    switch (captcha.provider) {
      case CaptchaDriverType.GOOGLE_RECAPTCHA:
        // Google reCAPTCHA tokens expire after 120 seconds, refresh at 110 seconds
        setInterval(requestFreshCaptchaToken, 110 * 1000);
        break;
      case CaptchaDriverType.TURNSTILE:
        // Cloudflare Turnstile tokens expire after 500 seconds, refresh at 480 seconds
        setInterval(requestFreshCaptchaToken, 480 * 1000);
        break;
      default:
        // Note: hCaptcha has a callback system for expiration that we're not implementing now
        return;
    }
  }, [captcha?.provider, requestFreshCaptchaToken, isCaptchaScriptLoaded]);

  return <></>;
};
