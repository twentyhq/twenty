import { CAPTCHA_TOKEN_REQUEST_TIMEOUT_IN_MS } from '@/captcha/constants/CaptchaTokenRequestTimeoutInMs';
import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { type CaptchaToken } from '@/captcha/types/CaptchaToken';
import { isCaptchaRequiredForPath } from '@/captcha/utils/isCaptchaRequiredForPath';
import { requestCaptchaTokenWhenReady } from '@/captcha/utils/requestCaptchaTokenWhenReady';
import { withTimeout } from '@/captcha/utils/withTimeout';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { logError } from '~/utils/logError';

export const useRequestFreshCaptchaToken = () => {
  const store = useStore();

  const requestFreshCaptchaToken = useCallback(async (): Promise<
    CaptchaToken | undefined
  > => {
    if (!isCaptchaRequiredForPath(window.location.pathname)) {
      return undefined;
    }

    try {
      const token = await withTimeout({
        run: (abortSignal) =>
          requestCaptchaTokenWhenReady({ store, abortSignal }),
        timeoutInMs: CAPTCHA_TOKEN_REQUEST_TIMEOUT_IN_MS,
        timeoutMessage: doNotTranslate('Captcha token request timed out'),
      });

      if (!isDefined(token)) {
        return undefined;
      }

      const captchaToken = { token, issuedAt: Date.now() };

      store.set(captchaTokenState.atom, captchaToken);

      return captchaToken;
    } catch (error) {
      // The server rejects the tokenless request, which surfaces a retryable error
      logError(error);

      return undefined;
    }
  }, [store]);

  return { requestFreshCaptchaToken };
};
