import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { ensureTokenRenewed } from '@/auth/utils/ensureTokenRenewed';
import { SSE_CONNECTION_RETRY_MAX_WAIT_TIME_IN_MS } from '@/sse-db-event/constants/SseConnectionRetryMaxWaitTimeInMs';
import { SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_FOR_DEV_MODE } from '@/sse-db-event/constants/SseConnectionRetryWaitTimeInMsForDevMode';
import { SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_TO_AVOID_RACE_CONDITIONS } from '@/sse-db-event/constants/SseConnectionRetryWaitTimeInMsToAvoidRaceConditions';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { type Client } from 'graphql-sse';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { getIsDevelopmentEnvironment } from '~/utils/getIsDevelopmentEnvironment';
import { sleep } from '~/utils/sleep';

const destroyStream = async (
  store: ReturnType<typeof useStore>,
  sseClient: Client,
) => {
  await sleep(SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_TO_AVOID_RACE_CONDITIONS);
  sseClient.dispose();
  store.set(shouldDestroyEventStreamState.atom, true);
  store.set(sseClientState.atom, null);
};

// The session cookie is httpOnly, so a cookie-mode client cannot inspect its own
// credential. clearSession drops both credentials together, so their joint
// absence is what "signed out" looks like from here.
const hasCredential = (store: ReturnType<typeof useStore>): boolean =>
  store.get(isCookieAuthActiveState.atom) ||
  isDefined(store.get(tokenPairState.atom)?.accessOrWorkspaceAgnosticToken);

export const useHandleSseClientConnectionRetry = () => {
  const store = useStore();

  const handleSseClientConnectionRetry = useCallback(
    async (retryCount: number) => {
      const sseClient = store.get(sseClientState.atom);

      if (!isDefined(sseClient)) {
        await sleep(
          SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_TO_AVOID_RACE_CONDITIONS,
        );
        return;
      }

      if (retryCount > 10) {
        await destroyStream(store, sseClient);
        return;
      }

      // Without this the loop is unbounded: graphql-sse resets its retry count
      // whenever a result arrives, so retryCount alone never trips on a stream
      // that keeps reconnecting. A signed-out client has to stop here.
      if (!hasCredential(store)) {
        await destroyStream(store, sseClient);
        return;
      }

      if (!store.get(isCookieAuthActiveState.atom)) {
        const accessToken = store.get(
          tokenPairState.atom,
        )?.accessOrWorkspaceAgnosticToken;

        if (
          isDefined(accessToken) &&
          new Date(accessToken.expiresAt) <= new Date()
        ) {
          const renewed = await ensureTokenRenewed(store);

          if (!renewed) {
            await destroyStream(store, sseClient);
            return;
          }
        }
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
