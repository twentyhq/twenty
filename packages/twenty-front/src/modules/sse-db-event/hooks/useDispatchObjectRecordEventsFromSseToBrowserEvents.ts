import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { dispatchObjectRecordOperationBrowserEvent } from '@/object-record/utils/dispatchObjectRecordOperationBrowserEvent';
import { groupObjectRecordSseEventsByObjectMetadataItemNameSingular } from '@/sse-db-event/utils/groupObjectRecordSseEventsByObjectMetadataItemNameSingular';
import { turnSseObjectRecordEventsToObjectRecordOperationBrowserEvents } from '@/sse-db-event/utils/turnSseObjectRecordEventToObjectRecordOperationBrowserEvent';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type EventWithQueryIds } from '~/generated-metadata/graphql';

export const useDispatchObjectRecordEventsFromSseToBrowserEvents = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const dispatchObjectRecordEventsFromSseToBrowserEvents = useCallback(
    (eventsWithQueryIds: EventWithQueryIds[]) => {
      const objectRecordEvents = eventsWithQueryIds.map((eventWithQueryIds) => {
        return eventWithQueryIds.event;
      });

      const objectRecordEventsByObjectMetadataItemNameSingular =
        groupObjectRecordSseEventsByObjectMetadataItemNameSingular({
          objectRecordEvents,
        });

      const objectMetadataItemNamesSingular = Array.from(
        objectRecordEventsByObjectMetadataItemNameSingular.keys(),
      );

      for (const objectMetadataItemNameSingular of objectMetadataItemNamesSingular) {
        const objectRecordEventsForThisObjectMetadataItem =
          objectRecordEventsByObjectMetadataItemNameSingular.get(
            objectMetadataItemNameSingular,
          ) ?? [];

        const objectMetadataItem = objectMetadataItems.find((metadataItem) => {
          return metadataItem.nameSingular === objectMetadataItemNameSingular;
        });

        if (!isDefined(objectMetadataItem)) {
          continue;
        }

        const objectRecordOperationBrowserEvents =
          turnSseObjectRecordEventsToObjectRecordOperationBrowserEvents({
            objectMetadataItem,
            objectRecordEvents: objectRecordEventsForThisObjectMetadataItem,
          });

        for (const browserEvent of objectRecordOperationBrowserEvents) {
          dispatchObjectRecordOperationBrowserEvent(browserEvent);
        }
      }
    },
    [objectMetadataItems],
  );

  return { dispatchObjectRecordEventsFromSseToBrowserEvents };
};
