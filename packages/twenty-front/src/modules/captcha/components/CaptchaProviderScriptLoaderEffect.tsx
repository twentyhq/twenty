import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { getCaptchaUrlByProvider } from '@/captcha/utils/getCaptchaUrlByProvider';
import { isCaptchaRequiredForPath } from '@/captcha/utils/isCaptchaRequiredForPath';
import { captchaState } from '@/client-config/states/captchaState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CaptchaDriverType } from '~/generated-metadata/graphql';

export const CaptchaProviderScriptLoaderEffect = () => {
  const captcha = useAtomStateValue(captchaState);
  const setIsCaptchaScriptLoaded = useSetAtomState(isCaptchaScriptLoadedState);
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

  return <></>;
};
