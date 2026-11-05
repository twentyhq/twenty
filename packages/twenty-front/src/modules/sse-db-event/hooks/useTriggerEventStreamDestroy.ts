import { SSE_EVENT_STREAM_HEALTHY_LIFETIME_IN_MS } from '@/sse-db-event/constants/SseEventStreamHealthyLifetimeInMs';
import { activeQueryListenersState } from '@/sse-db-event/states/activeQueryListenersState';
import { disposeFunctionForEventStreamState } from '@/sse-db-event/states/disposeFunctionByEventStreamMapState';
import { isCreatingSseEventStreamState } from '@/sse-db-event/states/isCreatingSseEventStreamState';
import { isDestroyingEventStreamState } from '@/sse-db-event/states/isDestroyingEventStreamState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseEventStreamCreatedAtTimestampState } from '@/sse-db-event/states/sseEventStreamCreatedAtTimestampState';
import { sseEventStreamEarliestCreationTimestampState } from '@/sse-db-event/states/sseEventStreamEarliestCreationTimestampState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { sseEventStreamReadyState } from '@/sse-db-event/states/sseEventStreamReadyState';
import { sseEventStreamShortLivedCountState } from '@/sse-db-event/states/sseEventStreamShortLivedCountState';
import { getSseEventStreamRecreationWaitTimeInMs } from '@/sse-db-event/utils/getSseEventStreamRecreationWaitTimeInMs';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useTriggerEventStreamDestroy = () => {
  const store = useStore();
  const setIsDestroyingEventStream = useSetAtomState(
    isDestroyingEventStreamState,
  );

  const triggerEventStreamDestroy = useCallback(() => {
    const isDestroyingEventStream = store.get(
      isDestroyingEventStreamState.atom,
    );

    const isCreatingSseEventStream = store.get(
      isCreatingSseEventStreamState.atom,
    );

    if (isDestroyingEventStream || isCreatingSseEventStream) {
      return;
    }

    setIsDestroyingEventStream(true);

    const eventStreamId = store.get(sseEventStreamIdState.atom);

    const disposeFunctionForEventStream = store.get(
      disposeFunctionForEventStreamState.atom,
    );

    if (isNonEmptyString(eventStreamId)) {
      disposeFunctionForEventStream?.dispose();

      const now = Date.now();
      const createdAtTimestamp = store.get(
        sseEventStreamCreatedAtTimestampState.atom,
      );
      const wasShortLived =
        isDefined(createdAtTimestamp) &&
        now - createdAtTimestamp < SSE_EVENT_STREAM_HEALTHY_LIFETIME_IN_MS;
      const shortLivedStreamCount = wasShortLived
        ? store.get(sseEventStreamShortLivedCountState.atom) + 1
        : 0;

      store.set(sseEventStreamShortLivedCountState.atom, shortLivedStreamCount);
      store.set(
        sseEventStreamEarliestCreationTimestampState.atom,
        now + getSseEventStreamRecreationWaitTimeInMs(shortLivedStreamCount),
      );

      store.set(sseEventStreamIdState.atom, null);
      store.set(activeQueryListenersState.atom, []);
      store.set(sseEventStreamReadyState.atom, false);
      store.set(disposeFunctionForEventStreamState.atom, null);
      store.set(shouldDestroyEventStreamState.atom, false);
    }

    setIsDestroyingEventStream(false);
  }, [setIsDestroyingEventStream, store]);

  return {
    triggerEventStreamDestroy,
  };
};
