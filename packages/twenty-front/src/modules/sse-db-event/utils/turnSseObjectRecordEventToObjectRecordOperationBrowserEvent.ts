import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
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
  objectMetadataItem: ObjectMetadataItem;
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

    const hasSingleEvent = objectRecordEventsForThisEventType.length === 1;

    switch (eventType) {
      case DatabaseEventAction.UPDATED: {
        const updateInputs = getObjectRecordOperationUpdateInputs(
          objectRecordEventsForThisEventType,
        );

        if (hasSingleEvent) {
          objectRecordOperationBrowserEvents.push({
            objectMetadataItem,
            operation: {
              type: 'update-one',
              result: { updateInput: updateInputs[0] },
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
        if (hasSingleEvent) {
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
        if (hasSingleEvent) {
          objectRecordOperationBrowserEvents.push({
            objectMetadataItem,
            operation: {
              type: 'restore-one',
              restoredRecord:
                objectRecordEventsForThisEventType[0].properties.after,
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
        if (hasSingleEvent) {
          objectRecordOperationBrowserEvents.push({
            objectMetadataItem,
            operation: {
              type: 'create-one',
              createdRecord:
                objectRecordEventsForThisEventType[0].properties.after,
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
        if (hasSingleEvent) {
          objectRecordOperationBrowserEvents.push({
            objectMetadataItem,
            operation: {
              type: 'create-one',
              createdRecord:
                objectRecordEventsForThisEventType[0].properties.after,
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
        if (hasSingleEvent) {
          objectRecordOperationBrowserEvents.push({
            objectMetadataItem,
            operation: {
              type: 'delete-one',
              deletedRecordId:
                objectRecordEventsForThisEventType[0].properties.before.id,
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
