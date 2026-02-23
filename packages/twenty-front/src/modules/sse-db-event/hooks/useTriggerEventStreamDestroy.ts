import { disposeFunctionForEventStreamState } from '@/sse-db-event/states/disposeFunctionByEventStreamMapState';
import { isCreatingSseEventStreamState } from '@/sse-db-event/states/isCreatingSseEventStreamState';
import { isDestroyingEventStreamState } from '@/sse-db-event/states/isDestroyingEventStreamState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { sseEventStreamReadyState } from '@/sse-db-event/states/sseEventStreamReadyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';

export const useTriggerEventStreamDestroy = () => {
  const setIsDestroyingEventStream = useSetRecoilStateV2(
    isDestroyingEventStreamState,
  );

  const triggerEventStreamDestroy = useCallback(() => {
    const isDestroyingEventStream = jotaiStore.get(
      isDestroyingEventStreamState.atom,
    );

    const isCreatingSseEventStream = jotaiStore.get(
      isCreatingSseEventStreamState.atom,
    );

    if (isDestroyingEventStream || isCreatingSseEventStream) {
      return;
    }

    setIsDestroyingEventStream(true);

    const eventStreamId = jotaiStore.get(sseEventStreamIdState.atom);

    const disposeFunctionForEventStream = jotaiStore.get(
      disposeFunctionForEventStreamState.atom,
    );

    if (isNonEmptyString(eventStreamId)) {
      disposeFunctionForEventStream?.dispose();

      jotaiStore.set(sseEventStreamIdState.atom, null);
      jotaiStore.set(sseEventStreamReadyState.atom, false);
      jotaiStore.set(disposeFunctionForEventStreamState.atom, null);
      jotaiStore.set(shouldDestroyEventStreamState.atom, false);
    }

    setIsDestroyingEventStream(false);
  }, [setIsDestroyingEventStream]);

  return {
    triggerEventStreamDestroy,
  };
};
