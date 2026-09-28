import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { getObjectRecordOperationUpdateInputs } from '@/sse-db-event/utils/getObjectRecordOperationUpdateInputs';
import { groupObjectRecordSseEventsByEventType } from '@/sse-db-event/utils/groupObjectRecordSseEventsByEventType';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import {
  DatabaseEventAction,
  type ObjectRecordEvent,
} from '~/generated-metadata/graphql';

export const turnSseObjectRecordEventsToObjectRecordOperationBrowserEvents = ({
  objectMetadataItem,
  objectRecordEvents,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectRecordEvents: ObjectRecordEvent[];
}): ObjectRecordOperationBrowserEventDetail[] => {
  const { objectRecordEventsByEventType } =
    groupObjectRecordSseEventsByEventType({
      objectRecordEvents,
    });

  const eventTypes = Array.from(objectRecordEventsByEventType.keys());

  const objectRecordOperationBrowserEvents: ObjectRecordOperationBrowserEventDetail[] =
    [];

  for (const eventType of eventTypes) {
    const objectRecordEventsForThisEventType =
      objectRecordEventsByEventType.get(eventType) ?? [];

    const [firstEvent, ...otherEvents] = objectRecordEventsForThisEventType;
    const singleEvent = otherEvents.length === 0 ? firstEvent : undefined;

    switch (eventType) {
      case DatabaseEventAction.UPDATED: {
        const updateInputs = getObjectRecordOperationUpdateInputs(
          objectRecordEventsForThisEventType,
        );

        const [singleUpdateInput] = updateInputs;

        if (isDefined(singleEvent) && isDefined(singleUpdateInput)) {
          objectRecordOperationBrowserEvents.push({
            objectMetadataItem,
            operation: {
              type: 'update-one',
              result: { updateInput: singleUpdateInput },
            },
          });
        } else {
          objectRecordOperationBrowserEvents.push({
            objectMetadataItem,
            operation: {
              type: 'update-many',
              result: { updateInputs },
            },
          });
        }
        break;
      }
      case DatabaseEventAction.DESTROYED:
        if (isDefined(singleEvent)) {
          objectRecordOperationBrowserEvents.push({
            objectMetadataItem,
            operation: {
              type: 'destroy-one',
            },
          });
        } else {
          objectRecordOperationBrowserEvents.push({
            objectMetadataItem,
            operation: {
              type: 'destroy-many',
            },
          });
        }
        break;
      case DatabaseEventAction.RESTORED:
        if (isDefined(singleEvent)) {
          objectRecordOperationBrowserEvents.push({
            objectMetadataItem,
            operation: {
              type: 'restore-one',
              restoredRecord: singleEvent.properties.after,
            },
          });
        } else {
          objectRecordOperationBrowserEvents.push({
            objectMetadataItem,
            operation: {
              type: 'restore-many',
              restoredRecords: objectRecordEventsForThisEventType.map(
                (event) => event.properties.after,
              ),
            },
          });
        }
        break;
      case DatabaseEventAction.UPSERTED:
        if (isDefined(singleEvent)) {
          objectRecordOperationBrowserEvents.push({
            objectMetadataItem,
            operation: {
              type: 'create-one',
              createdRecord: singleEvent.properties.after,
            },
          });
        } else {
          objectRecordOperationBrowserEvents.push({
            objectMetadataItem,
            operation: { type: 'create-many' },
          });
        }
        break;
      case DatabaseEventAction.CREATED:
        if (isDefined(singleEvent)) {
          objectRecordOperationBrowserEvents.push({
            objectMetadataItem,
            operation: {
              type: 'create-one',
              createdRecord: singleEvent.properties.after,
            },
          });
        } else {
          objectRecordOperationBrowserEvents.push({
            objectMetadataItem,
            operation: { type: 'create-many' },
          });
        }
        break;
      case DatabaseEventAction.DELETED:
        if (isDefined(singleEvent)) {
          objectRecordOperationBrowserEvents.push({
            objectMetadataItem,
            operation: {
              type: 'delete-one',
              deletedRecordId: singleEvent.properties.before.id,
            },
          });
        } else {
          objectRecordOperationBrowserEvents.push({
            objectMetadataItem,
            operation: {
              type: 'delete-many',
              deletedRecordIds: objectRecordEventsForThisEventType.map(
                (event) => event.properties.before.id,
              ),
            },
          });
        }
        break;
      default: {
        assertUnreachable(eventType);
      }
    }
  }

  return objectRecordOperationBrowserEvents.filter(isDefined);
};
