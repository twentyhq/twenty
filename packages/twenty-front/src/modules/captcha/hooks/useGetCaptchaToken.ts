import { CAPTCHA_TOKEN_MAX_AGE_IN_MS } from '@/captcha/constants/CaptchaTokenMaxAgeInMs';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { captchaState } from '@/client-config/states/captchaState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useGetCaptchaToken = () => {
  const store = useStore();
  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();

  const getCaptchaToken = useCallback(async (): Promise<string | undefined> => {
    const provider = store.get(captchaState.atom)?.provider;
    const prewarmedCaptchaToken = store.get(captchaTokenState.atom);

    const isPrewarmedCaptchaTokenUsable =
      isDefined(prewarmedCaptchaToken) &&
      isDefined(provider) &&
      Date.now() - prewarmedCaptchaToken.issuedAt <
        CAPTCHA_TOKEN_MAX_AGE_IN_MS[provider];

    const captchaToken = isPrewarmedCaptchaTokenUsable
      ? prewarmedCaptchaToken
      : await requestFreshCaptchaToken();

    // Providers accept a token once: drop it and prewarm the next one
    store.set(captchaTokenState.atom, undefined);
    requestFreshCaptchaToken();

    return captchaToken?.token;
  }, [requestFreshCaptchaToken, store]);

  return { getCaptchaToken };
};
