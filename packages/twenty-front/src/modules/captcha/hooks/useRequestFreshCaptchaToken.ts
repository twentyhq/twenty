import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { isRequestingCaptchaTokenState } from '@/captcha/states/isRequestingCaptchaTokenState';
import { captchaProviderState } from '@/client-config/states/captchaProviderState';
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

  const requestFreshCaptchaToken = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const captchaProvider = snapshot
          .getLoadable(captchaProviderState)
          .getValue();

        if (isUndefinedOrNull(captchaProvider)) {
          return;
        }

        setIsRequestingCaptchaToken(true);

        let captchaWidget: any;

        switch (captchaProvider.provider) {
          case CaptchaDriverType.GoogleRecaptcha:
            window.grecaptcha
              .execute(captchaProvider.siteKey, {
                action: 'submit',
              })
              .then((token: string) => {
                setCaptchaToken(token);
                setIsRequestingCaptchaToken(false);
              });
            break;
          case CaptchaDriverType.Turnstile:
            // TODO: fix workspace-no-hardcoded-colors rule
            // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
            captchaWidget = window.turnstile.render('#captcha-widget', {
              sitekey: captchaProvider.siteKey,
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
