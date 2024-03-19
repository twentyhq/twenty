import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { captchaProviderState } from '@/client-config/states/captchaProviderState';
import { CaptchaDriverType } from '~/generated-metadata/graphql';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export const useGenerateCaptchaToken = () => {
  const captchaProvider = useRecoilValue(captchaProviderState());

  const generateGoogleRecaptchaToken = useCallback(async () => {
    if (
      'grecaptcha' in window &&
      captchaProvider?.provider &&
      captchaProvider?.siteKey
    ) {
      return await (window.grecaptcha as any).execute(captchaProvider.siteKey, { action: 'submit' })
    }
  }, [captchaProvider?.provider, captchaProvider?.siteKey]);

  const generateCaptchaToken = useCallback(() => {
    if (!captchaProvider?.provider || !captchaProvider.siteKey) {
      return;
    }
    switch (captchaProvider.provider) {
      case CaptchaDriverType.GoogleRecatpcha:
        return generateGoogleRecaptchaToken();
        break;
    }
  }, [captchaProvider?.provider, captchaProvider?.siteKey]);

  return { generateCaptchaToken };
};
