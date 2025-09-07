import { useCallback, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { getCaptchaUrlByProvider } from '@/captcha/utils/getCaptchaUrlByProvider';
import { captchaState } from '@/client-config/states/captchaState';
import { useScriptLoader } from '~/hooks/useScriptLoader';
import { CaptchaDriverType } from '~/generated/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const CaptchaProviderScriptLoaderEffect = () => {
  const captcha = useRecoilValue(captchaState);
  const [isCaptchaScriptLoaded, setIsCaptchaScriptLoaded] = useRecoilState(
    isCaptchaScriptLoadedState,
  );
  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();

  const scriptUrl =
    captcha?.provider && captcha.siteKey
      ? getCaptchaUrlByProvider(captcha.provider, captcha.siteKey)
      : null;

  const handleLoad = useCallback(() => {
    if (captcha?.provider === CaptchaDriverType.GOOGLE_RECAPTCHA) {
      window.grecaptcha?.ready(() => {
        setIsCaptchaScriptLoaded(true);
      });
    } else {
      setIsCaptchaScriptLoaded(true);
    }
  }, [captcha?.provider, setIsCaptchaScriptLoaded]);

  useScriptLoader({ src: scriptUrl, onLoad: handleLoad });

  useEffect(() => {
    if (isUndefinedOrNull(captcha?.provider) || !isCaptchaScriptLoaded) {
      return;
    }

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
  }, [captcha?.provider, requestFreshCaptchaToken, isCaptchaScriptLoaded]);

  return <></>;
};
