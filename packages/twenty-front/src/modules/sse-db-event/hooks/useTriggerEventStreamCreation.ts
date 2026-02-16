import { ON_EVENT_SUBSCRIPTION } from '@/sse-db-event/graphql/subscriptions/OnEventSubscription';
import { useDispatchObjectRecordEventsFromSseToBrowserEvents } from '@/sse-db-event/hooks/useDispatchObjectRecordEventsFromSseToBrowserEvents';
import { useTriggerOptimisticEffectFromSseEvents } from '@/sse-db-event/hooks/useTriggerOptimisticEffectFromSseEvents';
import { disposeFunctionForEventStreamState } from '@/sse-db-event/states/disposeFunctionByEventStreamMapState';
import { isCreatingSseEventStreamState } from '@/sse-db-event/states/isCreatingSseEventStreamState';
import { isDestroyingEventStreamState } from '@/sse-db-event/states/isDestroyingEventStreamState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { sseEventStreamReadyState } from '@/sse-db-event/states/sseEventStreamReadyState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { captureException } from '@sentry/react';
import { isNonEmptyString } from '@sniptt/guards';
import { print, type ExecutionResult } from 'graphql';

import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { type EventSubscription } from '~/generated-metadata/graphql';

export const useTriggerEventStreamCreation = () => {
  const setIsCreatingSseEventStream = useSetRecoilState(
    isCreatingSseEventStreamState,
  );

  const { dispatchObjectRecordEventsFromSseToBrowserEvents } =
    useDispatchObjectRecordEventsFromSseToBrowserEvents();

  const { triggerOptimisticEffectFromSseEvents } =
    useTriggerOptimisticEffectFromSseEvents();

  const triggerEventStreamCreation = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const sseClient = snapshot.getLoadable(sseClientState).getValue();

        const isCreatingSseEventStream = snapshot
          .getLoadable(isCreatingSseEventStreamState)
          .getValue();

        const isDestroyingEventStream = snapshot
          .getLoadable(isDestroyingEventStreamState)
          .getValue();

        const currentSseEventStreamId = getSnapshotValue(
          snapshot,
          sseEventStreamIdState,
        );

        if (
          isCreatingSseEventStream ||
          isDestroyingEventStream ||
          !isDefined(sseClient) ||
          isNonEmptyString(currentSseEventStreamId)
        ) {
          return;
        }

        setIsCreatingSseEventStream(true);

        const newSseEventStreamId = v4();

        set(sseEventStreamIdState, newSseEventStreamId);
        set(sseEventStreamReadyState, false);

        let hasReceivedFirstEvent = false;

        const dispose = sseClient.subscribe(
          {
            query: print(ON_EVENT_SUBSCRIPTION),
            variables: {
              eventStreamId: newSseEventStreamId,
            },
          },
          {
            next: (
              value: ExecutionResult<{
                onEventSubscription: EventSubscription;
              }>,
            ) => {
              if (isDefined(value?.errors)) {
                captureException(
                  new Error(
                    `SSE subscription error: ${value.errors[0]?.message}`,
                  ),
                );
                set(shouldDestroyEventStreamState, true);

                return;
              }

              if (!hasReceivedFirstEvent) {
                hasReceivedFirstEvent = true;
                set(sseEventStreamReadyState, true);
              }

              const objectRecordEventsWithQueryIds =
                value?.data?.onEventSubscription?.eventWithQueryIdsList ?? [];

              const objectRecordEvents = objectRecordEventsWithQueryIds.map(
                (eventWithQueryIds) => {
                  return eventWithQueryIds.event;
                },
              );

              triggerOptimisticEffectFromSseEvents({
                objectRecordEvents,
              });

              dispatchObjectRecordEventsFromSseToBrowserEvents(
                objectRecordEventsWithQueryIds,
              );
            },
            error: (error) => {
              captureException(error);
            },
            complete: () => {},
          },
          {
            message: ({ data, event }) => {
              if (event === 'next') {
                if (isDefined(data?.errors)) {
                  const subCode = data.errors[0]?.extensions?.subCode;

                  switch (subCode) {
                    case 'EVENT_STREAM_ALREADY_EXISTS': {
                      set(shouldDestroyEventStreamState, true);
                      break;
                    }
                    default: {
                      captureException(
                        new Error(
                          `Unhandled SSE message error: ${data.errors[0]?.message}`,
                        ),
                      );
                      break;
                    }
                  }
                }
              }
            },
          },
        );

        set(disposeFunctionForEventStreamState, { dispose });

        setIsCreatingSseEventStream(false);
      },
    [
      dispatchObjectRecordEventsFromSseToBrowserEvents,
      setIsCreatingSseEventStream,

      triggerOptimisticEffectFromSseEvents,
    ],
  );

  return {
    triggerEventStreamCreation,
  };
};
