import { disposeFunctionForEventStreamState } from '@/sse-db-event/states/disposeFunctionByEventStreamMapState';
import { isCreatingSseEventStreamState } from '@/sse-db-event/states/isCreatingSseEventStreamState';
import { isDestroyingEventStreamState } from '@/sse-db-event/states/isDestroyingEventStreamState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { sseEventStreamReadyState } from '@/sse-db-event/states/sseEventStreamReadyState';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useStore } from 'jotai';

export const useTriggerEventStreamDestroy = () => {
  const store = useStore();
  const setIsDestroyingEventStream = useSetRecoilStateV2(
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

      store.set(sseEventStreamIdState.atom, null);
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
