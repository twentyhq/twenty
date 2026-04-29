import { renewToken } from '@/auth/services/AuthService';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { SSE_CONNECTION_RETRY_MAX_WAIT_TIME_IN_MS } from '@/sse-db-event/constants/SseConnectionRetryMaxWaitTimeInMs';
import { SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_FOR_DEV_MODE } from '@/sse-db-event/constants/SseConnectionRetryWaitTimeInMsForDevMode';
import { SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_TO_AVOID_RACE_CONDITIONS } from '@/sse-db-event/constants/SseConnectionRetryWaitTimeInMsToAvoidRaceConditions';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useStore } from 'jotai';
import { useCallback, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { getIsDevelopmentEnvironment } from '~/utils/getIsDevelopmentEnvironment';
import { retryWithBackoff } from '~/utils/retryWithBackoff';
import { sleep } from '~/utils/sleep';

const TOKEN_RENEWAL_MAX_RETRIES = 3;
const TOKEN_RENEWAL_RETRY_DELAY_MS = 1000;

export const useHandleSseClientConnectionRetry = () => {
  const store = useStore();

  // Shared promise so concurrent retry calls deduplicate into one renewal
  // request  mirrors the same pattern used in ApolloFactory.
  const renewalPromiseRef = useRef<Promise<boolean> | null>(null);

  const handleSseClientConnectionRetry = useCallback(
    async (retryCount: number) => {
      const sseClient = store.get(sseClientState.atom);

      if (!isDefined(sseClient)) {
        await sleep(
          SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_TO_AVOID_RACE_CONDITIONS,
        );

        return;
      }

      const tokenPair = store.get(tokenPairState.atom);
      const currentAppToken = tokenPair?.accessOrWorkspaceAgnosticToken?.token;

      if (!isDefined(currentAppToken)) {
        await sleep(
          SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_TO_AVOID_RACE_CONDITIONS,
        );

        sseClient.dispose();
        store.set(shouldDestroyEventStreamState.atom, true);
        store.set(sseClientState.atom, null);
        return;
      }

      // Attempt token renewal before each reconnect so the SSE client can
      // reconnect with a fresh JWT instead of showing the login screen.
      // We deduplicate concurrent renewal requests through renewalPromiseRef,
      // exactly like ApolloFactory does for its /graphql and /metadata clients.
      if (!renewalPromiseRef.current) {
        const metadataUri = `${REACT_APP_SERVER_BASE_URL}/metadata`;

        renewalPromiseRef.current = retryWithBackoff(
          () => renewToken(metadataUri, store.get(tokenPairState.atom)),
          {
            maxRetries: TOKEN_RENEWAL_MAX_RETRIES,
            baseDelayMs: TOKEN_RENEWAL_RETRY_DELAY_MS,
            shouldRetry: (error) =>
              !CombinedGraphQLErrors.is(error) &&
              isDefined(store.get(tokenPairState.atom)),
          },
        )
          .then((tokens) => {
            if (isDefined(tokens)) {
              store.set(tokenPairState.atom, tokens);
            }

            return true;
          })
          .catch(() => false)
          .finally(() => {
            renewalPromiseRef.current = null;
          });
      }

      const renewed = await renewalPromiseRef.current;

      if (!renewed || retryCount > 10) {
        await sleep(
          SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_TO_AVOID_RACE_CONDITIONS,
        );

        sseClient.dispose();
        store.set(shouldDestroyEventStreamState.atom, true);
        store.set(sseClientState.atom, null);
        return;
      }

      const randomWaitTimeInMsToSpaceAllClientsReconnection = Math.round(
        Math.random() * SSE_CONNECTION_RETRY_MAX_WAIT_TIME_IN_MS,
      );

      const isDevelopmentEnvironment = getIsDevelopmentEnvironment();

      const waitTimeInMs = isDevelopmentEnvironment
        ? SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_FOR_DEV_MODE
        : randomWaitTimeInMsToSpaceAllClientsReconnection;

      await sleep(waitTimeInMs);
    },
    [store],
  );

  return { handleSseClientConnectionRetry };
};
