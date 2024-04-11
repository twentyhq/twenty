import { useCallback, useRef } from 'react';
import { useRecoilValue } from 'recoil';

import { captchaProviderState } from '@/client-config/states/captchaProviderState';
import { CaptchaDriverType } from '~/generated-metadata/graphql';

declare global {
  interface Window {
    grecaptcha?: any;
    turnstile?: any;
    hcaptcha?: any;
  }
}

export const useGenerateCaptchaToken = () => {
  const captchaProvider = useRecoilValue(captchaProviderState);
  // eslint-disable-next-line @nx/workspace-no-state-useref
  const captchaWidgetId = useRef<string | null>(null);

  const generateCaptchaToken = useCallback(
    async (isLoaded: boolean): Promise<string | undefined> => {
      if (!isLoaded || !captchaProvider?.provider || !captchaProvider.siteKey) {
        return;
      }

      const renderCaptchaWidget = (renderFn: any, widgetId: string) => {
        if (captchaWidgetId.current === null) {
          captchaWidgetId.current = renderFn(widgetId, {
            sitekey: captchaProvider.siteKey,
          });
        }
      };

      const executeCaptcha = (executeFn: any): Promise<string | undefined> => {
        return new Promise((resolve, reject) => {
          executeFn(captchaWidgetId.current, { action: 'submit' })
            .then((token: string) => resolve(token))
            .catch((error: any) => reject(error));
        });
      };

      switch (captchaProvider.provider) {
        case CaptchaDriverType.GoogleRecatpcha:
          if ('grecaptcha' in window) {
            renderCaptchaWidget(window.grecaptcha.render, 'captcha-widget');
            return executeCaptcha(window.grecaptcha.execute);
          }
          break;
        case CaptchaDriverType.Turnstile:
          if ('turnstile' in window) {
            // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
            renderCaptchaWidget(window.turnstile.render, '#captcha-widget');
            window.turnstile.reset(captchaWidgetId.current);
            return new Promise((resolve, reject) => {
              window.turnstile.execute(captchaWidgetId.current, {
                callback: (token: string) => {
                  resolve(token);
                },
                'error-callback': (error: any) => {
                  reject(error);
                },
              });
            });
          }
          break;
        case CaptchaDriverType.HCaptcha:
          if ('hcaptcha' in window) {
            renderCaptchaWidget(window.hcaptcha.render, 'captcha-widget');
            return new Promise((resolve, reject) => {
              window.hcaptcha
                .execute(captchaWidgetId.current, { async: true })
                .then(({ response }: any) => resolve(response))
                .catch((error: any) => reject(error));
            });
          }
          break;
      }
    },
    [captchaProvider?.provider, captchaProvider?.siteKey],
  );

  return { generateCaptchaToken };
};
