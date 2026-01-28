import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { SSE_CONNECTION_RETRY_MAX_WAIT_TIME_IN_MS } from '@/sse-db-event/constants/SseConnectionRetryMaxWaitTimeInMs';
import { activeQueryListenersState } from '@/sse-db-event/states/activeQueryListenersState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { createClient } from 'graphql-sse';
import { useMemo } from 'react';
import { useRecoilCallback } from 'recoil';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { sleep } from '~/utils/sleep';

export const useSseClient = () => {
  const tokenPair = getTokenPair();
  const token = tokenPair?.accessOrWorkspaceAgnosticToken?.token;

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

  const sseClient = useMemo(
    () =>
      createClient({
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

          await sleep(randomWaitTimeInMsToSpaceAllClientsReconnection);
        },
      }),

    [token, handleSSEClientConnected],
  );

  return {
    sseClient,
  };
};
