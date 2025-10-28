import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { getCaptchaUrlByProvider } from '@/captcha/utils/getCaptchaUrlByProvider';
import { isCaptchaRequiredForPath } from '@/captcha/utils/isCaptchaRequiredForPath';
import { useCaptcha } from '@/client-config/hooks/useCaptcha';
import { captchaState } from '@/client-config/states/captchaState';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { CaptchaDriverType } from '~/generated/graphql';

export const CaptchaProviderScriptLoaderEffect = () => {
  const captcha = useRecoilValue(captchaState);
  const setIsCaptchaScriptLoaded = useSetRecoilState(
    isCaptchaScriptLoadedState,
  );
  const { isCaptchaScriptLoaded, isCaptchaConfigured } = useCaptcha();
  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();
  const location = useLocation();

  useEffect(() => {
    if (
      !captcha?.provider ||
      !captcha.siteKey ||
      !isCaptchaRequiredForPath(location.pathname)
    ) {
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
  }, [
    captcha?.provider,
    captcha?.siteKey,
    setIsCaptchaScriptLoaded,
    location.pathname,
  ]);

  useEffect(() => {
    if (!isCaptchaConfigured || !isCaptchaScriptLoaded) {
      return;
    }

    assertIsDefinedOrThrow(captcha);

    let refreshInterval: NodeJS.Timeout;

    switch (captcha.provider) {
      case CaptchaDriverType.GOOGLE_RECAPTCHA:
        // Google reCAPTCHA tokens expire after 120 seconds, refresh at 110 seconds
        refreshInterval = setInterval(requestFreshCaptchaToken, 110 * 1000);
        break;
      case CaptchaDriverType.TURNSTILE:
        // Cloudflare Turnstile tokens expire after 500 seconds, refresh at 480 seconds
        refreshInterval = setInterval(requestFreshCaptchaToken, 480 * 1000);
        break;
      default:
        // Note: hCaptcha has a callback system for expiration that we're not implementing now
        return;
    }

    return () => clearInterval(refreshInterval);
  }, [
    captcha,
    captcha?.provider,
    isCaptchaConfigured,
    isCaptchaScriptLoaded,
    requestFreshCaptchaToken,
  ]);

  return <></>;
};
