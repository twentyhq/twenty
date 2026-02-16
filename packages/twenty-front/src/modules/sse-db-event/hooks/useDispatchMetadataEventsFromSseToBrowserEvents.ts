import { dispatchMetadataOperationBrowserEvent } from '@/object-metadata/utils/dispatchMetadataOperationBrowserEvent';
import { turnSseMetadataEventsToMetadataOperationBrowserEvents } from '@/sse-db-event/utils/turnSseMetadataEventsToMetadataOperationBrowserEvents';
import { useCallback } from 'react';
import {
  type MetadataEvent,
  type MetadataEventWithQueryIds,
} from '~/generated-metadata/graphql';

const groupSseMetadataEventsByMetadataName = (
  sseMetadataEvents: MetadataEvent[],
): Map<string, MetadataEvent[]> => {
  const eventsByMetadataName = new Map<string, MetadataEvent[]>();

  for (const event of sseMetadataEvents) {
    const existing = eventsByMetadataName.get(event.metadataName) ?? [];

    eventsByMetadataName.set(event.metadataName, [...existing, event]);
  }

  return eventsByMetadataName;
};

export const useDispatchMetadataEventsFromSseToBrowserEvents = () => {
  const dispatchMetadataEventsFromSseToBrowserEvents = useCallback(
    (metadataEventsWithQueryIds: MetadataEventWithQueryIds[]) => {
      const sseMetadataEvents = metadataEventsWithQueryIds.map(
        (item) => item.metadataEvent,
      );

      const eventsByMetadataName =
        groupSseMetadataEventsByMetadataName(sseMetadataEvents);

      for (const [metadataName, events] of eventsByMetadataName) {
        const metadataOperationBrowserEvents =
          turnSseMetadataEventsToMetadataOperationBrowserEvents({
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
