import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { captchaProviderState } from '@/client-config/states/captchaProviderState';
import { CaptchaDriverType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

declare global {
  interface Window {
    grecaptcha?: any;
    turnstile?: any;
  }
}

export const useCaptchaToken = () => {
  const setCaptchaToken = useSetRecoilState(captchaTokenState);

  const preloadFreshCaptchaToken = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const captchaProvider = snapshot
          .getLoadable(captchaProviderState)
          .getValue();

        if (isUndefinedOrNull(captchaProvider)) {
          return;
        }

        let captchaWidget: any;
        let token: string;

        switch (captchaProvider.provider) {
          case CaptchaDriverType.GoogleRecatpcha:
            token = await window.grecaptcha.execute(captchaProvider.siteKey, {
              action: 'submit',
            });
            setCaptchaToken(token);
            break;
          case CaptchaDriverType.Turnstile:
            // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
            captchaWidget = window.turnstile.render('#captcha-widget', {
              sitekey: captchaProvider.siteKey,
            });
            window.turnstile.execute(captchaWidget, {
              callback: (token: string) => {
                setCaptchaToken(token);
              },
            });
        }
      },
    [setCaptchaToken],
  );

  const getPreloadedOrFreshCaptchaToken = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const captchaProvider = snapshot
          .getLoadable(captchaProviderState)
          .getValue();

        const existingCaptchaToken = snapshot
          .getLoadable(captchaTokenState)
          .getValue();

        if (isDefined(existingCaptchaToken)) {
          return existingCaptchaToken;
        }

        if (isUndefinedOrNull(captchaProvider)) {
          return;
        }

        let captchaWidget: any;
        let token: string;

        switch (captchaProvider.provider) {
          case CaptchaDriverType.GoogleRecatpcha:
            token = await window.grecaptcha.execute(captchaProvider.siteKey, {
              action: 'submit',
            });
            setCaptchaToken(token);
            return token;
          case CaptchaDriverType.Turnstile:
            // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
            captchaWidget = window.turnstile.render('#captcha-widget', {
              sitekey: captchaProvider.siteKey,
            });
            token = await new Promise((resolve, reject) => {
              window.turnstile.execute(captchaWidget, {
                callback: (token: string) => {
                  resolve(token);
                },
                'error-callback': (error: any) => {
                  reject(error);
                },
              });
            });
            setCaptchaToken(token);

            return token;
        }
      },
    [setCaptchaToken],
  );

  return { getPreloadedOrFreshCaptchaToken, preloadFreshCaptchaToken };
};
