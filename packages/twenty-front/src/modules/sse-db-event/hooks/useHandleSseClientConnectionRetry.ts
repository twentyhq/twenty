import { tokenPairState } from '@/auth/states/tokenPairState';
import { SSE_CONNECTION_RETRY_MAX_WAIT_TIME_IN_MS } from '@/sse-db-event/constants/SseConnectionRetryMaxWaitTimeInMs';
import { SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_FOR_DEV_MODE } from '@/sse-db-event/constants/SseConnectionRetryWaitTimeInMsForDevMode';
import { SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_TO_AVOID_RACE_CONDITIONS } from '@/sse-db-event/constants/SseConnectionRetryWaitTimeInMsToAvoidRaceConditions';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { getIsDevelopmentEnvironment } from '~/utils/getIsDevelopmentEnvironment';
import { sleep } from '~/utils/sleep';

export const useHandleSseClientConnectionRetry = () => {
  const handleSseClientConnectionRetry = useCallback(
    async (retryCount: number, initialTokenForSseClient: string) => {
      const sseClient = jotaiStore.get(sseClientState.atom);

      if (!isDefined(sseClient)) {
        await sleep(
          SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_TO_AVOID_RACE_CONDITIONS,
        );

        return;
      }

      const tokenPair = jotaiStore.get(tokenPairState.atom);
      const currentAppToken = tokenPair?.accessOrWorkspaceAgnosticToken?.token;

      const shouldResetSseClient =
        !isDefined(currentAppToken) ||
        currentAppToken !== initialTokenForSseClient ||
        retryCount > 10;

      if (shouldResetSseClient) {
        await sleep(
          SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_TO_AVOID_RACE_CONDITIONS,
        );

        sseClient.dispose();
        jotaiStore.set(shouldDestroyEventStreamState.atom, true);
        jotaiStore.set(sseClientState.atom, null);
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
    [],
  );

  return { handleSseClientConnectionRetry };
};
