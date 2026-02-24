import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useReadCaptchaToken = () => {
  const readCaptchaToken = useCallback(() => {
    const existingCaptchaToken = jotaiStore.get(captchaTokenState.atom);

    if (isDefined(existingCaptchaToken)) {
      return existingCaptchaToken;
    }
  }, []);

  return { readCaptchaToken };
};
