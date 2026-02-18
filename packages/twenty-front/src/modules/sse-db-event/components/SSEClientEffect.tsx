import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useHandleSseClientConnectionRetry } from '@/sse-db-event/hooks/useHandleSseClientConnectionRetry';
import { activeQueryListenersState } from '@/sse-db-event/states/activeQueryListenersState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isNonEmptyArray } from '@sniptt/guards';
import { createClient } from 'graphql-sse';
import { useEffect } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const SSEClientEffect = () => {
  const isLoggedIn = useIsLogged();
  const [sseClient, setSseClient] = useRecoilState(sseClientState);
  const [tokenPair] = useRecoilState(tokenPairState);

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

  const { handleSseClientConnectionRetry } =
    useHandleSseClientConnectionRetry();

  useEffect(() => {
    if (isLoggedIn && !isDefined(sseClient) && isDefined(tokenPair)) {
      const token = tokenPair?.accessOrWorkspaceAgnosticToken?.token;

      const newSseClient = createClient({
        url: `${REACT_APP_SERVER_BASE_URL}/metadata`,
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        on: {
          connected: handleSSEClientConnected,
        },
        retryAttempts: Infinity,
        retry: (retryCount: number) =>
          handleSseClientConnectionRetry(retryCount, token),
      });

      setSseClient(newSseClient);
    }
  }, [
    handleSSEClientConnected,
    isLoggedIn,
    setSseClient,
    sseClient,
    tokenPair,
    handleSseClientConnectionRetry,
  ]);

  return null;
};
