import { ON_EVENT_SUBSCRIPTION } from '@/sse-db-event/graphql/subscriptions/OnEventSubscription';
import { useDispatchObjectRecordEventsFromSseToBrowserEvents } from '@/sse-db-event/hooks/useDispatchObjectRecordEventsFromSseToBrowserEvents';
import { useTriggerOptimisticEffectFromSseEvents } from '@/sse-db-event/hooks/useTriggerOptimisticEffectFromSseEvents';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { captureException } from '@sentry/react';
import { isNonEmptyString } from '@sniptt/guards';
import { print, type ExecutionResult } from 'graphql';
import { type Client } from 'graphql-sse';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';
import { type EventSubscription } from '~/generated/graphql';

export const useSubscribeToSseEventStream = () => {
  const { dispatchObjectRecordEventsFromSseToBrowserEvents } =
    useDispatchObjectRecordEventsFromSseToBrowserEvents();

  const { triggerOptimisticEffectFromSseEvents } =
    useTriggerOptimisticEffectFromSseEvents();

  const subscribeToSseEventStream = useRecoilCallback(
    ({ set, snapshot }) =>
      (sseClientConnected: Client) => {
        const currentSseEventStreamId = getSnapshotValue(
          snapshot,
          sseEventStreamIdState,
        );

        if (isNonEmptyString(currentSseEventStreamId)) {
          return;
        }

        const newSseEventStreamId = v4();

        set(sseEventStreamIdState, newSseEventStreamId);

        sseClientConnected.subscribe(
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
        );
      },
    [
      triggerOptimisticEffectFromSseEvents,
      dispatchObjectRecordEventsFromSseToBrowserEvents,
    ],
  );

  return {
    subscribeToSseEventStream,
  };
};
