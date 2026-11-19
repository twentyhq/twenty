import { CAPTCHA_TOKEN_REQUEST_TIMEOUT_IN_MS } from '@/captcha/constants/CaptchaTokenRequestTimeoutInMs';
import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { type CaptchaToken } from '@/captcha/types/CaptchaToken';
import { isCaptchaRequiredForPath } from '@/captcha/utils/isCaptchaRequiredForPath';
import { requestCaptchaTokenFromProvider } from '@/captcha/utils/requestCaptchaTokenFromProvider';
import { waitForAtomValue } from '@/captcha/utils/waitForAtomValue';
import { captchaState } from '@/client-config/states/captchaState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
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

    const requestToken = async () => {
      await waitForAtomValue(
        store,
        clientConfigApiStatusState.atom,
        ({ isLoadedOnce }) => isLoadedOnce,
      );

      const { provider, siteKey } = store.get(captchaState.atom) ?? {};

      if (!isDefined(provider) || !isDefined(siteKey)) {
        return undefined;
      }

      await waitForAtomValue(
        store,
        isCaptchaScriptLoadedState.atom,
        (isCaptchaScriptLoaded) => isCaptchaScriptLoaded,
      );

      return requestCaptchaTokenFromProvider({ provider, siteKey });
    };

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      const token = await Promise.race([
        requestToken(),
        new Promise<never>((_resolve, reject) => {
          timeoutId = setTimeout(
            () =>
              reject(
                new Error(doNotTranslate('Captcha token request timed out')),
              ),
            CAPTCHA_TOKEN_REQUEST_TIMEOUT_IN_MS,
          );
        }),
      ]);

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
    } finally {
      clearTimeout(timeoutId);
    }
  }, [store]);

  return { requestFreshCaptchaToken };
};
