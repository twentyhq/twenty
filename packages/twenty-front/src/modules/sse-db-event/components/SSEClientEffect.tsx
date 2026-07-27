import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useResyncMetadataStore } from '@/metadata-store/hooks/useResyncMetadataStore';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { SSE_RESYNC_DEBOUNCE_TIME_IN_MS } from '@/sse-db-event/constants/SseResyncDebounceTimeInMs';
import { useHandleSseClientConnectionRetry } from '@/sse-db-event/hooks/useHandleSseClientConnectionRetry';
import { activeQueryListenersState } from '@/sse-db-event/states/activeQueryListenersState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { captureException } from '@sentry/react';
import { isNonEmptyArray } from '@sniptt/guards';
import { createClient } from 'graphql-sse';
import { useCallback, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useStore } from 'jotai';

export const SSEClientEffect = () => {
  const store = useStore();
  const hasAccessTokenPair = useHasAccessTokenPair();
  const [sseClient, setSseClient] = useAtomState(sseClientState);
  const tokenPair = useAtomStateValue(tokenPairState);
  const { resyncMetadataStore } = useResyncMetadataStore();
  const apolloCoreClient = useApolloCoreClient();

  const resyncAfterReconnection = useCallback(() => {
    resyncMetadataStore();

    apolloCoreClient.refetchQueries({ include: 'active' }).catch((error) => {
      captureException(
        new Error('Failed to resync records after SSE reconnection', {
          cause: error,
        }),
      );
    });
  }, [apolloCoreClient, resyncMetadataStore]);

  const debouncedResyncAfterReconnection = useDebouncedCallback(
    resyncAfterReconnection,
    SSE_RESYNC_DEBOUNCE_TIME_IN_MS,
    { leading: false },
  );

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: debouncedResyncAfterReconnection,
  });

  const handleSSEClientConnected = useCallback(
    (reconnected: boolean) => {
      const currentActiveQueryListeners = store.get(
        activeQueryListenersState.atom,
      );

      if (isNonEmptyArray(currentActiveQueryListeners)) {
        store.set(activeQueryListenersState.atom, []);
      }

      if (reconnected) {
        dispatchBrowserEvent(SSE_CLIENT_RECONNECTED_EVENT_NAME);
      }
    },
    [store],
  );

  const { handleSseClientConnectionRetry } =
    useHandleSseClientConnectionRetry();

  useEffect(() => {
    if (hasAccessTokenPair && !isDefined(sseClient) && isDefined(tokenPair)) {
      const newSseClient = createClient({
        url: `${REACT_APP_SERVER_BASE_URL}/metadata`,
        headers: () => {
          const currentTokenPair = store.get(tokenPairState.atom);
          const token = currentTokenPair?.accessOrWorkspaceAgnosticToken?.token;

          return {
            Authorization: token ? `Bearer ${token}` : '',
          };
        },
        on: {
          connected: handleSSEClientConnected,
        },
        retryAttempts: Infinity,
        retry: (retryCount: number) =>
          handleSseClientConnectionRetry(retryCount),
      });

      setSseClient(newSseClient);
    }
  }, [
    handleSSEClientConnected,
    hasAccessTokenPair,
    setSseClient,
    sseClient,
    store,
    tokenPair,
    handleSseClientConnectionRetry,
  ]);

  return null;
};
