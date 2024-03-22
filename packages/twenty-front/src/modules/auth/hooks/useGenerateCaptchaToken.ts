import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { captchaProviderState } from '@/client-config/states/captchaProviderState';
import { CaptchaDriverType } from '~/generated-metadata/graphql';

declare global {
  interface Window {
    grecaptcha: any;
    turnstile: any;
    hcaptcha: any;
  }
}

export const useGenerateCaptchaToken = () => {
  const captchaProvider = useRecoilValue(captchaProviderState);

  const generateGoogleRecaptchaToken = useCallback(async () => {
    if (
      'grecaptcha' in window &&
      captchaProvider?.provider &&
      captchaProvider?.siteKey
    ) {
      return await (window.grecaptcha as any).execute(captchaProvider.siteKey, { action: 'submit' })
    }
  }, [captchaProvider?.provider, captchaProvider?.siteKey]);

  const generateTurnstileCaptchaToken = useCallback(async () => {
    if ( 'turnstile' in window && captchaProvider?.provider && captchaProvider.siteKey) {
      return new Promise((resolve) => {
        (window.turnstile as any).render('#captcha-widget', {
          sitekey: captchaProvider.siteKey,
          callback: (token: string) => {
            resolve(token);
          }
        });
      });
    }
  }, [captchaProvider?.provider, captchaProvider?.siteKey]);

  const generateHcaptchaToken = useCallback(async () => {
    if ( 'hcaptcha' in window && captchaProvider?.provider && captchaProvider.siteKey) {
      return new Promise((resolve) => {
        (window.hcaptcha as any).render('#captcha-widget', {
          sitekey: captchaProvider.siteKey,
          callback: (token: string) => {
            resolve(token);
          }
        });
      });
    }
  }, []);

  const generateCaptchaToken = useCallback(() => {
    if (!captchaProvider?.provider || !captchaProvider.siteKey) {
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
  }, [captchaProvider?.provider, captchaProvider?.siteKey]);

  return { generateCaptchaToken };
};
