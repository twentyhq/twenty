import { useCallback } from 'react';

import { useStore } from 'jotai';
import { jwtDecode } from 'jwt-decode';

import { tokenPairState } from '@/auth/states/tokenPairState';
import { SSE_CONNECTION_RETRY_MAX_WAIT_TIME_IN_MS } from '@/sse-db-event/constants/SseConnectionRetryMaxWaitTimeInMs';
import { SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_FOR_DEV_MODE } from '@/sse-db-event/constants/SseConnectionRetryWaitTimeInMsForDevMode';
import { SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_TO_AVOID_RACE_CONDITIONS } from '@/sse-db-event/constants/SseConnectionRetryWaitTimeInMsToAvoidRaceConditions';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';

import { isDefined } from 'twenty-shared/utils';

import { getIsDevelopmentEnvironment } from '~/utils/getIsDevelopmentEnvironment';
import { sleep } from '~/utils/sleep';

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

      const tokenPair = store.get(tokenPairState.atom);
      const currentAppToken = tokenPair?.accessOrWorkspaceAgnosticToken?.token;

      let isTokenExpired = false;

      if (isDefined(currentAppToken)) {
        try {
          const decodedToken = jwtDecode<{ exp: number }>(currentAppToken);

          if (isDefined(decodedToken.exp)) {
            isTokenExpired = decodedToken.exp * 1000 < Date.now();
          }
        } catch (error) {
          isTokenExpired = true;
        }
      }

      const shouldResetSseClient =
        !isDefined(currentAppToken) || isTokenExpired || retryCount > 10;

      if (shouldResetSseClient) {
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
