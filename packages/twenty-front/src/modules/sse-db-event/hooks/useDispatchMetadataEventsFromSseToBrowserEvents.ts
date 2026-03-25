import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { turnSseMetadataEventsToMetadataOperationBrowserEvents } from '@/sse-db-event/utils/turnSseMetadataEventsToMetadataOperationBrowserEvents';
import { useCallback } from 'react';
import {
  type AllMetadataName,
  type MetadataEvent,
} from '~/generated-metadata/graphql';

const groupSseMetadataEventsByMetadataName = (
  sseMetadataEvents: MetadataEvent[],
): Map<AllMetadataName, MetadataEvent[]> => {
  const eventsByMetadataName = new Map<AllMetadataName, MetadataEvent[]>();

  for (const event of sseMetadataEvents) {
    const metadataName = event.metadataName as AllMetadataName;

    const existing = eventsByMetadataName.get(metadataName) ?? [];

    eventsByMetadataName.set(metadataName, [...existing, event]);
  }

  return eventsByMetadataName;
};

export const useDispatchMetadataEventsFromSseToBrowserEvents = <
  T extends Record<string, unknown>,
>() => {
  const dispatchMetadataEventsFromSseToBrowserEvents = useCallback(
    (metadataEvents: MetadataEvent[]) => {
      const eventsByMetadataName =
        groupSseMetadataEventsByMetadataName(metadataEvents);

      for (const [metadataName, events] of eventsByMetadataName) {
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
