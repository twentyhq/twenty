import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { requestCaptchaTokenFromProvider } from '@/captcha/utils/requestCaptchaTokenFromProvider';
import { waitForAtomValue } from '@/captcha/utils/waitForAtomValue';
import { captchaState } from '@/client-config/states/captchaState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const requestCaptchaTokenWhenReady = async ({
  store,
  abortSignal,
}: {
  store: ReturnType<typeof createStore>;
  abortSignal: AbortSignal;
}): Promise<string | undefined> => {
  await waitForAtomValue({
    store,
    atom: clientConfigApiStatusState.atom,
    isExpectedValue: ({ isLoadedOnce }) => isLoadedOnce,
    abortSignal,
  });

  const { provider, siteKey } = store.get(captchaState.atom) ?? {};

  if (!isDefined(provider) || !isDefined(siteKey)) {
    return undefined;
  }

  await waitForAtomValue({
    store,
    atom: isCaptchaScriptLoadedState.atom,
    isExpectedValue: (isCaptchaScriptLoaded) => isCaptchaScriptLoaded,
    abortSignal,
  });

  return requestCaptchaTokenFromProvider({ provider, siteKey, abortSignal });
};
