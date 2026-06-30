import { SSE_LIVENESS_CHECK_INTERVAL_IN_MS } from '@/sse-db-event/constants/SseLivenessCheckIntervalInMs';
import { SSE_LIVENESS_TIMEOUT_IN_MS } from '@/sse-db-event/constants/SseLivenessTimeoutInMs';
import { activeQueryListenersState } from '@/sse-db-event/states/activeQueryListenersState';
import { lastSseEventReceivedTimestampState } from '@/sse-db-event/states/lastSseEventReceivedTimestampState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { sseEventStreamReadyState } from '@/sse-db-event/states/sseEventStreamReadyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const SSEKeepAliveEffect = () => {
  const store = useStore();
  const sseEventStreamReady = useAtomStateValue(sseEventStreamReadyState);
  const sseEventStreamId = useAtomStateValue(sseEventStreamIdState);

  useEffect(() => {
    if (!sseEventStreamReady || !isNonEmptyString(sseEventStreamId)) {
      return;
    }

    const interval = setInterval(() => {
      const lastTimestamp = store.get(lastSseEventReceivedTimestampState.atom);

      if (!isDefined(lastTimestamp)) {
        return;
      }

      const timeSinceLastEvent = Date.now() - lastTimestamp;

      if (timeSinceLastEvent > SSE_LIVENESS_TIMEOUT_IN_MS) {
        store.set(activeQueryListenersState.atom, []);
        store.set(shouldDestroyEventStreamState.atom, true);
      }
    }, SSE_LIVENESS_CHECK_INTERVAL_IN_MS);

    return () => clearInterval(interval);
  }, [sseEventStreamReady, sseEventStreamId, store]);

  return null;
};
