import { disposeFunctionForEventStreamState } from '@/sse-db-event/states/disposeFunctionByEventStreamMapState';
import { isCreatingSseEventStreamState } from '@/sse-db-event/states/isCreatingSseEventStreamState';
import { isDestroyingEventStreamState } from '@/sse-db-event/states/isDestroyingEventStreamState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { sseEventStreamReadyState } from '@/sse-db-event/states/sseEventStreamReadyState';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

export const useTriggerEventStreamDestroy = () => {
  const setIsDestroyingEventStream = useSetRecoilState(
    isDestroyingEventStreamState,
  );

  const triggerEventStreamDestroy = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const isDestroyingEventStream = snapshot
          .getLoadable(isDestroyingEventStreamState)
          .getValue();

        const isCreatingSseEventStream = snapshot
          .getLoadable(isCreatingSseEventStreamState)
          .getValue();

        if (isDestroyingEventStream || isCreatingSseEventStream) {
          return;
        }

        setIsDestroyingEventStream(true);

        const eventStreamId = snapshot
          .getLoadable(sseEventStreamIdState)
          .getValue();

        const disposeFunctionForEventStream = snapshot
          .getLoadable(disposeFunctionForEventStreamState)
          .getValue();

        if (isNonEmptyString(eventStreamId)) {
          disposeFunctionForEventStream?.dispose();

          set(sseEventStreamIdState, null);
          set(sseEventStreamReadyState, false);
          set(disposeFunctionForEventStreamState, null);
          set(shouldDestroyEventStreamState, false);
        }

        setIsDestroyingEventStream(false);
      },
    [setIsDestroyingEventStream],
  );

  return {
    triggerEventStreamDestroy,
  };
};
