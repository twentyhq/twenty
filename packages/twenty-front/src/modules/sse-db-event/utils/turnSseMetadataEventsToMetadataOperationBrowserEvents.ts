import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { isDefined } from 'twenty-shared/utils';
import {
  MetadataEventAction,
  type AllMetadataName,
  type MetadataEvent,
} from '~/generated-metadata/graphql';

export const turnSseMetadataEventsToMetadataOperationBrowserEvents = <
  T extends Record<string, unknown>,
>({
  metadataName,
  sseMetadataEvents,
}: {
  metadataName: AllMetadataName;
  sseMetadataEvents: MetadataEvent[];
}): MetadataOperationBrowserEventDetail<T>[] => {
  return sseMetadataEvents
    .map((event): MetadataOperationBrowserEventDetail<T> | null => {
      const updatedCollectionHash = event.updatedCollectionHash ?? undefined;

      switch (event.type) {
        case MetadataEventAction.CREATED: {
          const createdRecord = event.properties.after;

          if (!isDefined(createdRecord)) {
            return null;
          }

          return {
            metadataName,
            operation: {
              type: 'create',
              createdRecord,
            },
            updatedCollectionHash,
          };
        }
        case MetadataEventAction.UPDATED: {
          const updatedRecord = event.properties.after;

          if (!isDefined(updatedRecord)) {
            return null;
          }

          return {
            metadataName,
            operation: {
              type: 'update',
              updatedRecord,
              updatedFields: event.properties.updatedFields ?? undefined,
            },
            updatedCollectionHash,
          };
        }
        case MetadataEventAction.DELETED: {
          return {
            metadataName,
            operation: {
              type: 'delete',
              deletedRecordId: event.recordId,
            },
            updatedCollectionHash,
          };
        }
        default:
          return null;
      }
    })
    .filter(isDefined);
};
