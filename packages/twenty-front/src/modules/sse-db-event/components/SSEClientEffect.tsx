import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { SSE_CONNECTION_RETRY_MAX_WAIT_TIME_IN_MS } from '@/sse-db-event/constants/SseConnectionRetryMaxWaitTimeInMs';
import { SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_FOR_DEV_MODE } from '@/sse-db-event/constants/SseConnectionRetryWaitTimeInMsForDevMode';
import { activeQueryListenersState } from '@/sse-db-event/states/activeQueryListenersState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isNonEmptyArray } from '@sniptt/guards';
import { createClient } from 'graphql-sse';
import { useEffect } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { getIsDevelopmentEnvironment } from '~/utils/getIsDevelopmentEnvironment';

import { sleep } from '~/utils/sleep';

export const SSEClientEffect = () => {
  const isLoggedIn = useIsLogged();
  const [sseClient, setSseClient] = useRecoilState(sseClientState);

  const handleSSEClientConnected = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const currentActiveQueryListeners = getSnapshotValue(
          snapshot,
          activeQueryListenersState,
        );

        if (isNonEmptyArray(currentActiveQueryListeners)) {
          set(activeQueryListenersState, []);
        }
      },
    [],
  );

  useEffect(() => {
    if (isLoggedIn && !isDefined(sseClient)) {
      const tokenPair = getTokenPair();
      const token = tokenPair?.accessOrWorkspaceAgnosticToken?.token;

      const newSseClient = createClient({
        url: `${REACT_APP_SERVER_BASE_URL}/graphql`,
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        on: {
          connected: handleSSEClientConnected,
        },
        retryAttempts: Infinity,
        retry: async () => {
          const randomWaitTimeInMsToSpaceAllClientsReconnection = Math.round(
            Math.random() * SSE_CONNECTION_RETRY_MAX_WAIT_TIME_IN_MS,
          );

          const isDevelopmentEnvironment = getIsDevelopmentEnvironment();

          const waitTimeInMs = isDevelopmentEnvironment
            ? SSE_CONNECTION_RETRY_WAIT_TIME_IN_MS_FOR_DEV_MODE
            : randomWaitTimeInMsToSpaceAllClientsReconnection;

          await sleep(waitTimeInMs);
        },
      });

      setSseClient(newSseClient);
    }
  }, [handleSSEClientConnected, isLoggedIn, setSseClient, sseClient]);

  return null;
};
