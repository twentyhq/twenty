import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useTriggerOptimisticEffectFromSseCreateEvents } from '@/sse-db-event/hooks/useTriggerOptimisticEffectFromSseCreateEvents';
import { useTriggerOptimisticEffectFromSseDeleteEvents } from '@/sse-db-event/hooks/useTriggerOptimisticEffectFromSseDeleteEvents';
import { useTriggerOptimisticEffectFromSseRestoreEvents } from '@/sse-db-event/hooks/useTriggerOptimisticEffectFromSseRestoreEvents';
import { useTriggerOptimisticEffectFromSseUpdateEvents } from '@/sse-db-event/hooks/useTriggerOptimisticEffectFromSseUpdateEvents';
import { groupObjectRecordSseEventsByEventType } from '@/sse-db-event/utils/groupObjectRecordSseEventsByEventType';
import { groupObjectRecordSseEventsByObjectMetadataItemNameSingular } from '@/sse-db-event/utils/groupObjectRecordSseEventsByObjectMetadataItemNameSingular';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  DatabaseEventAction,
  type ObjectRecordEvent,
} from '~/generated-metadata/graphql';

export const useTriggerOptimisticEffectFromSseEvents = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const { triggerOptimisticEffectFromSseUpdateEvents } =
    useTriggerOptimisticEffectFromSseUpdateEvents();

  const { triggerOptimisticEffectFromSseCreateEvents } =
    useTriggerOptimisticEffectFromSseCreateEvents();

  const { triggerOptimisticEffectFromSseDeleteEvents } =
    useTriggerOptimisticEffectFromSseDeleteEvents();

  const { triggerOptimisticEffectFromSseRestoreEvents } =
    useTriggerOptimisticEffectFromSseRestoreEvents();

  const triggerOptimisticEffectFromSseEvents = useCallback(
    ({ objectRecordEvents }: { objectRecordEvents: ObjectRecordEvent[] }) => {
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

        const { objectRecordEventsByEventType } =
          groupObjectRecordSseEventsByEventType({
            objectRecordEvents: objectRecordEventsForThisObjectMetadataItem,
          });

        const sseEventTypes = Array.from(objectRecordEventsByEventType.keys());

        for (const sseEventType of sseEventTypes) {
          const objectRecordEventsForThisEventType =
            objectRecordEventsByEventType.get(sseEventType) ?? [];

          switch (sseEventType) {
            case DatabaseEventAction.UPDATED:
              triggerOptimisticEffectFromSseUpdateEvents({
                objectRecordEvents: objectRecordEventsForThisEventType,
                objectMetadataItem,
              });
              break;
            case DatabaseEventAction.CREATED:
              triggerOptimisticEffectFromSseCreateEvents({
                objectRecordEvents: objectRecordEventsForThisEventType,
                objectMetadataItem,
              });
              break;
            case DatabaseEventAction.DELETED:
              triggerOptimisticEffectFromSseDeleteEvents({
                objectRecordEvents: objectRecordEventsForThisEventType,
                objectMetadataItem,
              });
              break;
            case DatabaseEventAction.RESTORED:
              triggerOptimisticEffectFromSseRestoreEvents({
                objectRecordEvents: objectRecordEventsForThisEventType,
                objectMetadataItem,
              });
              break;
          }
        }
      }
    },
    [
      objectMetadataItems,
      triggerOptimisticEffectFromSseUpdateEvents,
      triggerOptimisticEffectFromSseCreateEvents,
      triggerOptimisticEffectFromSseDeleteEvents,
      triggerOptimisticEffectFromSseRestoreEvents,
    ],
  );

  return { triggerOptimisticEffectFromSseEvents };
};
