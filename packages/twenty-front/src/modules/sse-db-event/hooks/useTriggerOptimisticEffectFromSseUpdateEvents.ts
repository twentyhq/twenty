import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthRecordGqlFieldsFromRecord } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueriesForObjectMetadataItem } from '@/object-record/hooks/useRefetchAggregateQueriesForObjectMetadataItem';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { useCallback } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import {
  DatabaseEventAction,
  type ObjectRecordEvent,
} from '~/generated-metadata/graphql';

export const useTriggerOptimisticEffectFromSseUpdateEvents = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { refetchAggregateQueriesForObjectMetadataItem } =
    useRefetchAggregateQueriesForObjectMetadataItem();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const triggerOptimisticEffectFromSseUpdateEvents = useCallback(
    ({
      objectRecordEvents,
      objectMetadataItem,
    }: {
      objectRecordEvents: ObjectRecordEvent[];
      objectMetadataItem: ObjectMetadataItem;
    }) => {
      const updateEvents = objectRecordEvents.filter((objectRecordEvent) => {
        return objectRecordEvent.action === DatabaseEventAction.UPDATED;
      });

      for (const updateEvent of updateEvents) {
        const updatedRecord = updateEvent.properties.after;

        if (!isDefined(updatedRecord)) {
          continue;
        }

        upsertRecordsInStore({ partialRecords: [updatedRecord] });

        const computedOptimisticRecord = {
          ...computeOptimisticRecordFromInput({
            cache: apolloCoreClient.cache,
            objectMetadataItem,
            objectMetadataItems,
            recordInput: updatedRecord,
            objectPermissionsByObjectMetadataId,
            currentWorkspaceMember: null,
          }),
          id: updatedRecord.id,
          __typename: getObjectTypename(objectMetadataItem.nameSingular),
        };

        const recordGqlFields = generateDepthRecordGqlFieldsFromRecord({
          objectMetadataItem,
          objectMetadataItems,
          record: computedOptimisticRecord,
          depth: 0,
        });

        const cachedRecord = getRecordFromCache({
          cache: apolloCoreClient.cache,
          objectMetadataItem,
          objectMetadataItems,
          recordId: updatedRecord.id,
          recordGqlFields,
          objectPermissionsByObjectMetadataId,
        });

        const cachedRecordWithConnection = getRecordNodeFromRecord({
          record: cachedRecord,
          objectMetadataItem,
          objectMetadataItems,
          recordGqlFields,
          computeReferences: false,
        });

        if (
          !isDefined(cachedRecord) ||
          !isDefined(cachedRecordWithConnection)
        ) {
          continue;
        }

        updateRecordFromCache({
          objectMetadataItems,
          objectMetadataItem,
          cache: apolloCoreClient.cache,
          record: computedOptimisticRecord,
          recordGqlFields,
          objectPermissionsByObjectMetadataId,
        });

        const computedOptimisticRecordWithConnection = getRecordNodeFromRecord({
          record: computedOptimisticRecord,
          objectMetadataItem,
          objectMetadataItems,
          recordGqlFields,
        });

        if (!isDefined(computedOptimisticRecordWithConnection)) {
          continue;
        }

        triggerUpdateRecordOptimisticEffect({
          cache: apolloCoreClient.cache,
          objectMetadataItem,
          currentRecord: cachedRecordWithConnection,
          updatedRecord: computedOptimisticRecordWithConnection,
          objectMetadataItems,
          objectPermissionsByObjectMetadataId,
          upsertRecordsInStore,
        });
      }

      if (isNonEmptyArray(updateEvents)) {
        refetchAggregateQueriesForObjectMetadataItem({
          objectMetadataItem,
        });
      }

      return isNonEmptyArray(updateEvents);
    },
    [
      apolloCoreClient.cache,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
      refetchAggregateQueriesForObjectMetadataItem,
      upsertRecordsInStore,
    ],
  );

  return {
    triggerOptimisticEffectFromSseUpdateEvents,
  };
};
