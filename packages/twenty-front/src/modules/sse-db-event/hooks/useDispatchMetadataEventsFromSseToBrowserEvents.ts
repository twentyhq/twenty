import { type BroadcastEntityName } from '@/browser-event/types/BroadcastEntityName';
import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { turnSseMetadataEventsToMetadataOperationBrowserEvents } from '@/sse-db-event/utils/turnSseMetadataEventsToMetadataOperationBrowserEvents';
import { useCallback } from 'react';
import { type MetadataEvent } from '~/generated-metadata/graphql';

const groupSseMetadataEventsByEntityName = (
  sseMetadataEvents: MetadataEvent[],
): Map<BroadcastEntityName, MetadataEvent[]> => {
  const eventsByEntityName = new Map<BroadcastEntityName, MetadataEvent[]>();

  for (const event of sseMetadataEvents) {
    const entityName = event.metadataName as BroadcastEntityName;

    const existing = eventsByEntityName.get(entityName) ?? [];

    eventsByEntityName.set(entityName, [...existing, event]);
  }

  return eventsByEntityName;
};

export const useDispatchMetadataEventsFromSseToBrowserEvents = <
  T extends Record<string, unknown>,
>() => {
  const dispatchMetadataEventsFromSseToBrowserEvents = useCallback(
    (metadataEvents: MetadataEvent[]) => {
      const eventsByEntityName =
        groupSseMetadataEventsByEntityName(metadataEvents);

      for (const [metadataName, events] of eventsByEntityName) {
        const metadataOperationBrowserEvents =
          turnSseMetadataEventsToMetadataOperationBrowserEvents<T>({
            metadataName,
            sseMetadataEvents: events,
          });

        for (const browserEvent of metadataOperationBrowserEvents) {
          dispatchMetadataOperationBrowserEvent(browserEvent);
        }
      }
    },
    [],
  );

  return { dispatchMetadataEventsFromSseToBrowserEvents };
};
