import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useHandleSseClientConnectionRetry } from '@/sse-db-event/hooks/useHandleSseClientConnectionRetry';
import { activeQueryListenersState } from '@/sse-db-event/states/activeQueryListenersState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { isNonEmptyArray } from '@sniptt/guards';
import { createClient } from 'graphql-sse';
import { useCallback, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useStore } from 'jotai';

export const SSEClientEffect = () => {
  const store = useStore();
  const isLoggedIn = useIsLogged();
  const [sseClient, setSseClient] = useRecoilStateV2(sseClientState);
  const tokenPair = useRecoilValueV2(tokenPairState);

  const handleSSEClientConnected = useCallback(() => {
    const currentActiveQueryListeners = store.get(
      activeQueryListenersState.atom,
    );

    if (isNonEmptyArray(currentActiveQueryListeners)) {
      store.set(activeQueryListenersState.atom, []);
    }
  }, [store]);

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
