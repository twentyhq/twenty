import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { isRequestingCaptchaTokenState } from '@/captcha/states/isRequestingCaptchaTokenState';
import { isCaptchaRequiredForPath } from '@/captcha/utils/isCaptchaRequiredForPath';
import { captchaState } from '@/client-config/states/captchaState';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { CaptchaDriverType } from '~/generated-metadata/graphql';

export const useRequestFreshCaptchaToken = () => {
  const setCaptchaToken = useSetRecoilState(captchaTokenState);
  const setIsRequestingCaptchaToken = useSetRecoilState(
    isRequestingCaptchaTokenState,
  );

  const requestFreshCaptchaToken = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        if (!isCaptchaRequiredForPath(window.location.pathname)) {
          return;
        }

        const captcha = snapshot.getLoadable(captchaState).getValue();

        if (!isDefined(captcha)) {
          return;
        }

        assertIsDefinedOrThrow(captcha);

        setIsRequestingCaptchaToken(true);

        let captchaWidget: any;
        switch (captcha.provider) {
          case CaptchaDriverType.GOOGLE_RECAPTCHA:
            window.grecaptcha
              .execute(captcha.siteKey, {
                action: 'submit',
              })
              .then((token: string) => {
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
      },
    [setCaptchaToken, setIsRequestingCaptchaToken],
  );

  return { requestFreshCaptchaToken };
};
