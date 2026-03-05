import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';

export const useReadCaptchaToken = () => {
  const store = useStore();
  const readCaptchaToken = useCallback(() => {
    const existingCaptchaToken = store.get(captchaTokenState.atom);

    if (isDefined(existingCaptchaToken)) {
      return existingCaptchaToken;
    }
  }, [store]);

  return { readCaptchaToken };
};
