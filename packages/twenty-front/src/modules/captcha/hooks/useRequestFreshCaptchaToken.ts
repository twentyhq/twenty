import { useRecoilValue, useSetRecoilState } from 'recoil';

import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { isRequestingCaptchaTokenState } from '@/captcha/states/isRequestingCaptchaTokenState';
import { isCaptchaRequiredForPath } from '@/captcha/utils/isCaptchaRequiredForPath';
import { captchaState } from '@/client-config/states/captchaState';
import { useLocation } from 'react-router-dom';
import { CaptchaDriverType } from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

declare global {
  interface Window {
    grecaptcha?: any;
    turnstile?: any;
  }
}

export const useRequestFreshCaptchaToken = () => {
  const setCaptchaToken = useSetRecoilState(captchaTokenState);
  const setIsRequestingCaptchaToken = useSetRecoilState(
    isRequestingCaptchaTokenState,
  );
  const captcha = useRecoilValue(captchaState);

  const location = useLocation();

  const requestFreshCaptchaToken = async () => {
    if (!isCaptchaRequiredForPath(location.pathname)) {
      return;
    }

    if (isUndefinedOrNull(captcha?.provider)) {
      return;
    }

    setIsRequestingCaptchaToken(true);

    let captchaWidget: any;

    switch (captcha.provider) {
      case CaptchaDriverType.GOOGLE_RECAPTCHA:
        window.grecaptcha
          .execute(captcha.siteKey, {
            action: 'submit',
          })
          .then((token: string) => {
            // TODO remove this log once debugged
            // eslint-disable-next-line no-console
            console.log(
              'Google Recaptcha token generated at',
              new Date().toISOString(),
            );
            setCaptchaToken(token);
            setIsRequestingCaptchaToken(false);
          });
        break;
      case CaptchaDriverType.TURNSTILE:
        captchaWidget = window.turnstile.render('#captcha-widget', {
          sitekey: captcha.siteKey,
        });
        window.turnstile.execute(captchaWidget, {
          callback: (token: string) => {
            setCaptchaToken(token);
            setIsRequestingCaptchaToken(false);
          },
        });
    }
  };

  return { requestFreshCaptchaToken };
};
