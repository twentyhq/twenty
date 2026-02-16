import { type MetadataOperationBrowserEventDetail } from '@/object-metadata/types/MetadataOperationBrowserEventDetail';
import { isDefined } from 'twenty-shared/utils';
import {
  MetadataEventAction,
  type MetadataEvent,
} from '~/generated-metadata/graphql';

export const turnSseMetadataEventsToMetadataOperationBrowserEvents = ({
  metadataName,
  sseMetadataEvents,
}: {
  metadataName: string;
  sseMetadataEvents: MetadataEvent[];
}): MetadataOperationBrowserEventDetail[] => {
  return sseMetadataEvents
    .map((event): MetadataOperationBrowserEventDetail | null => {
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
          };
        }
        case MetadataEventAction.DELETED: {
          return {
            metadataName,
            operation: {
              type: 'delete',
              deletedRecordId: event.recordId,
            },
          };
        }
        default:
          return null;
      }
    })
    .filter(isDefined);
};
