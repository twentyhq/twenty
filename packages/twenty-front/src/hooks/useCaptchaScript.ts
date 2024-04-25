import { useRecoilState, useRecoilValue } from 'recoil';

import { isCaptchaLoadedState } from '@/auth/states/isCaptchaLoadedState';
import { captchaProviderState } from '@/client-config/states/captchaProviderState';
import { getCaptchaUrlByProvider } from '~/utils/captcha';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useCaptchaScript = () => {
  const captchaProvider = useRecoilValue(captchaProviderState);
  const [isCaptchaLoaded, setIsCaptchaLoaded] =
    useRecoilState(isCaptchaLoadedState);

  const scriptElementId = 'captcha-script';
  let scriptElement: HTMLScriptElement | null = document.getElementById(
    scriptElementId,
  ) as HTMLScriptElement | null;

  const loadCaptchaScript = () => {
    if (
      isUndefinedOrNull(captchaProvider) ||
      isUndefinedOrNull(captchaProvider.provider) ||
      isUndefinedOrNull(captchaProvider.siteKey)
    ) {
      return false;
    }
    const scriptUrl = getCaptchaUrlByProvider(
      captchaProvider.provider,
      captchaProvider.siteKey,
    );
    if (!scriptUrl) {
      return false;
    }

    if (isUndefinedOrNull(scriptElement)) {
      scriptElement = document.createElement('script');
      scriptElement.id = scriptElementId;
      scriptElement.src = scriptUrl;
      scriptElement.onload = () => {
        setIsCaptchaLoaded(true);
      };
      document.body.appendChild(scriptElement);
    }
    return isCaptchaLoaded;
  };

  const unloadCaptchaScript = () => {
    if (!isUndefinedOrNull(scriptElement)) {
      scriptElement.remove();
    }

    try {
      if (!isUndefinedOrNull(window.grecaptcha)) {
        window.grecaptcha.reset(scriptElementId);
      }
      if (!isUndefinedOrNull(window.turnstile)) {
        window.turnstile.reset('#' + scriptElementId);
      }
      if (!isUndefinedOrNull(window.hcaptcha)) {
        window.hcaptcha.reset(scriptElementId);
      }
    } catch (error) {
      // There is no official method to unload
      // so the closest is to call a reset that will fail
    }

    delete window.grecaptcha;
    delete window.turnstile;
    delete window.hcaptcha;

    setIsCaptchaLoaded(false);

    return isCaptchaLoaded;
  };

  return { loadCaptchaScript, unloadCaptchaScript };
};
