import { ON_EVENT_SUBSCRIPTION } from '@/sse-db-event/graphql/subscriptions/OnEventSubscription';
import { useDispatchMetadataEventsFromSseToBrowserEvents } from '@/sse-db-event/hooks/useDispatchMetadataEventsFromSseToBrowserEvents';
import { useDispatchObjectRecordEventsFromSseToBrowserEvents } from '@/sse-db-event/hooks/useDispatchObjectRecordEventsFromSseToBrowserEvents';
import { useTriggerOptimisticEffectFromSseEvents } from '@/sse-db-event/hooks/useTriggerOptimisticEffectFromSseEvents';
import { disposeFunctionForEventStreamState } from '@/sse-db-event/states/disposeFunctionByEventStreamMapState';
import { isCreatingSseEventStreamState } from '@/sse-db-event/states/isCreatingSseEventStreamState';
import { isDestroyingEventStreamState } from '@/sse-db-event/states/isDestroyingEventStreamState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { sseEventStreamReadyState } from '@/sse-db-event/states/sseEventStreamReadyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { captureException } from '@sentry/react';
import { isNonEmptyString } from '@sniptt/guards';
import { print, type ExecutionResult } from 'graphql';

import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { type EventSubscription } from '~/generated-metadata/graphql';

export const useTriggerEventStreamCreation = () => {
  const setIsCreatingSseEventStream = useSetRecoilStateV2(
    isCreatingSseEventStreamState,
  );

  const { dispatchMetadataEventsFromSseToBrowserEvents } =
    useDispatchMetadataEventsFromSseToBrowserEvents();

  const { dispatchObjectRecordEventsFromSseToBrowserEvents } =
    useDispatchObjectRecordEventsFromSseToBrowserEvents();

  const { triggerOptimisticEffectFromSseEvents } =
    useTriggerOptimisticEffectFromSseEvents();

  const triggerEventStreamCreation = useCallback(() => {
    const sseClient = jotaiStore.get(sseClientState.atom);

    const isCreatingSseEventStream = jotaiStore.get(
      isCreatingSseEventStreamState.atom,
    );

    const isDestroyingEventStream = jotaiStore.get(
      isDestroyingEventStreamState.atom,
    );

    const currentSseEventStreamId = jotaiStore.get(sseEventStreamIdState.atom);

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

    jotaiStore.set(sseEventStreamIdState.atom, newSseEventStreamId);
    jotaiStore.set(sseEventStreamReadyState.atom, false);

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
              new Error(`SSE subscription error: ${value.errors[0]?.message}`),
            );
            jotaiStore.set(shouldDestroyEventStreamState.atom, true);

            return;
          }

          if (!hasReceivedFirstEvent) {
            hasReceivedFirstEvent = true;
            jotaiStore.set(sseEventStreamReadyState.atom, true);
          }

          const eventSubscription = value?.data?.onEventSubscription;

          const objectRecordEventsWithQueryIds =
            eventSubscription?.objectRecordEventsWithQueryIds ?? [];

          const metadataEventsWithQueryIds =
            eventSubscription?.metadataEventsWithQueryIds ?? [];

          const objectRecordEvents = objectRecordEventsWithQueryIds.map(
            (item) => item.objectRecordEvent,
          );

          triggerOptimisticEffectFromSseEvents({
            objectRecordEvents,
          });

          dispatchObjectRecordEventsFromSseToBrowserEvents(
            objectRecordEventsWithQueryIds,
          );

          dispatchMetadataEventsFromSseToBrowserEvents(
            metadataEventsWithQueryIds,
          );
        },
        error: (error) => {
          captureException(error);
        },
        complete: () => {},
      },
      {
        message: ({ data, event }) => {
          const result = data as ExecutionResult<{
            onEventSubscription: EventSubscription;
          }>;

          try {
            if (event === 'next') {
              if (isDefined(result?.errors)) {
                const subCode = result.errors[0]?.extensions?.subCode;

                switch (subCode) {
                  case 'EVENT_STREAM_ALREADY_EXISTS': {
                    jotaiStore.set(shouldDestroyEventStreamState.atom, true);
                    break;
                  }
                  default: {
                    for (const error of result.errors) {
                      captureException(error);
                    }
                  }
                }

                jotaiStore.set(shouldDestroyEventStreamState.atom, true);
              } else {
                if (!hasReceivedFirstEvent) {
                  hasReceivedFirstEvent = true;
                  jotaiStore.set(sseEventStreamReadyState.atom, true);
                }

                const objectRecordEventsWithQueryIds =
                  result?.data?.onEventSubscription
                    ?.objectRecordEventsWithQueryIds ?? [];

                const objectRecordEvents = objectRecordEventsWithQueryIds.map(
                  (objectRecordEventWithQueryIds) => {
                    return objectRecordEventWithQueryIds.objectRecordEvent;
                  },
                );

                triggerOptimisticEffectFromSseEvents({
                  objectRecordEvents,
                });

                dispatchObjectRecordEventsFromSseToBrowserEvents(
                  objectRecordEventsWithQueryIds,
                );
              }
            }
          } catch (error) {
            const errorProcessingSSEMessage = new Error(
              'Error while processing SSE message',
              { cause: error instanceof Error ? error : undefined },
            );

            captureException(errorProcessingSSEMessage);
          }
        },
      },
    );

    jotaiStore.set(disposeFunctionForEventStreamState.atom, { dispose });

    setIsCreatingSseEventStream(false);
  }, [
    dispatchMetadataEventsFromSseToBrowserEvents,
    dispatchObjectRecordEventsFromSseToBrowserEvents,
    setIsCreatingSseEventStream,
    triggerOptimisticEffectFromSseEvents,
  ]);

  return {
    triggerEventStreamCreation,
  };
};
