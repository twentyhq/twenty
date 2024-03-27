/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
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

  const generateGoogleRecaptchaToken = useCallback(async (): Promise<
    string | undefined
  > => {
    if (
      'grecaptcha' in window &&
      captchaProvider?.provider &&
      captchaProvider?.siteKey
    ) {
      if (captchaWidgetId.current === null) {
        captchaWidgetId.current = (window.grecaptcha as any).render(
          'captcha-widget',
          {
            sitekey: captchaProvider.siteKey,
          },
        );
      }

      return new Promise((resolve, reject) => {
        (window.grecaptcha as any)
          .execute(captchaWidgetId.current, { action: 'submit' })
          .then((token: string) => resolve(token))
          .catch((error: any) => reject(error));
      });
    }
  }, [captchaProvider?.provider, captchaProvider?.siteKey]);

  const generateTurnstileCaptchaToken = useCallback(async (): Promise<
    string | undefined
  > => {
    if (
      'turnstile' in window &&
      captchaProvider?.provider &&
      captchaProvider.siteKey
    ) {
      if (captchaWidgetId.current === null) {
        captchaWidgetId.current = (window.turnstile as any).render(
          // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
          '#captcha-widget',
          {
            sitekey: captchaProvider.siteKey,
          },
        );
      }

      return new Promise((resolve, reject) => {
        window.turnstile.reset(captchaWidgetId.current);
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
  }, [captchaProvider?.provider, captchaProvider?.siteKey]);

  const generateHcaptchaToken = useCallback(async (): Promise<
    string | undefined
  > => {
    if (
      'hcaptcha' in window &&
      captchaProvider?.provider &&
      captchaProvider.siteKey
    ) {
      if (captchaWidgetId.current === null) {
        captchaWidgetId.current = (window.hcaptcha as any).render(
          'captcha-widget',
          {
            sitekey: captchaProvider.siteKey,
          },
        );
      }

      return new Promise((resolve, reject) => {
        window.hcaptcha
          .execute(captchaWidgetId.current, { async: true })
          .then(({ response }: any) => resolve(response))
          .catch((error: any) => reject(error));
      });
    }
  }, [captchaProvider?.provider, captchaProvider?.siteKey]);

  const generateCaptchaToken = useCallback(
    (isLoaded: boolean) => {
      if (!isLoaded || !captchaProvider?.provider || !captchaProvider.siteKey) {
        return;
      }

      switch (captchaProvider.provider) {
        case CaptchaDriverType.GoogleRecatpcha:
          return generateGoogleRecaptchaToken();
        case CaptchaDriverType.Turnstile:
          return generateTurnstileCaptchaToken();
        case CaptchaDriverType.HCaptcha:
          return generateHcaptchaToken();
      }
    },
    [
      captchaProvider?.provider,
      captchaProvider?.siteKey,
      generateGoogleRecaptchaToken,
      generateTurnstileCaptchaToken,
      generateHcaptchaToken,
    ],
  );

  return { generateCaptchaToken };
};
