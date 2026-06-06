import { renewToken } from '@/auth/services/AuthService';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { retryWithBackoff } from '~/utils/retryWithBackoff';

const TOKEN_RENEWAL_MAX_RETRIES = 3;
const TOKEN_RENEWAL_RETRY_DELAY_MS = 1000;

let renewalPromise: Promise<boolean> | null = null;

export const ensureTokenRenewed = (
  store: ReturnType<typeof createStore>,
): Promise<boolean> => {
  if (isDefined(renewalPromise)) {
    return renewalPromise;
  }

  const tokenPair = store.get(tokenPairState.atom);

  if (!isDefined(tokenPair)) {
    return Promise.resolve(false);
  }

  const refreshTokenSnapshot = tokenPair.refreshToken.token;

  renewalPromise = retryWithBackoff(
    () =>
      renewToken(
        `${REACT_APP_SERVER_BASE_URL}/metadata`,
        store.get(tokenPairState.atom),
      ),
    {
      maxRetries: TOKEN_RENEWAL_MAX_RETRIES,
      baseDelayMs: TOKEN_RENEWAL_RETRY_DELAY_MS,
      shouldRetry: () => isDefined(store.get(tokenPairState.atom)),
    },
  )
    .then((tokens) => {
      if (!isDefined(tokens)) return true;

      const currentPair = store.get(tokenPairState.atom);

      if (
        isDefined(currentPair) &&
        currentPair.refreshToken.token === refreshTokenSnapshot
      ) {
        store.set(tokenPairState.atom, tokens);
      }

      return true;
    })
    .catch(() => false)
    .finally(() => {
      renewalPromise = null;
    });

  return renewalPromise;
};
