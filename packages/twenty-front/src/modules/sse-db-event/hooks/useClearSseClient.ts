import { activeQueryListenersState } from '@/sse-db-event/states/activeQueryListenersState';
import { requiredQueryListenersState } from '@/sse-db-event/states/requiredQueryListenersState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { sseEventStreamReadyState } from '@/sse-db-event/states/sseEventStreamReadyState';
import { useCallback } from 'react';
import { useStore } from 'jotai';

export const useClearSseClient = () => {
  const store = useStore();

  const clearSseClient = useCallback(() => {
    const sseClient = store.get(sseClientState.atom);

    store.set(sseClientState.atom, null);
    store.set(sseEventStreamIdState.atom, null);
    store.set(sseEventStreamReadyState.atom, false);
    store.set(activeQueryListenersState.atom, []);
    store.set(requiredQueryListenersState.atom, []);

    sseClient?.dispose();
  }, [store]);

  return { clearSseClient };
};
