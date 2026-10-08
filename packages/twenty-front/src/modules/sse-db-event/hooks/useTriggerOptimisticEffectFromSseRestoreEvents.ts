import { triggerUpdateRecordOptimisticEffectByBatch } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffectByBatch';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueriesForObjectMetadataItem } from '@/object-record/hooks/useRefetchAggregateQueriesForObjectMetadataItem';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  DatabaseEventAction,
  type ObjectRecordEvent,
} from '~/generated-metadata/graphql';

export const useTriggerOptimisticEffectFromSseRestoreEvents = () => {
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { refetchAggregateQueriesForObjectMetadataItem } =
    useRefetchAggregateQueriesForObjectMetadataItem();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const debouncedRefetchAggregateQueriesForObjectMetadataItem =
    useDebouncedCallback(refetchAggregateQueriesForObjectMetadataItem, 100);

  const triggerOptimisticEffectFromSseRestoreEvents = useCallback(
    ({
      objectRecordEvents,
      objectMetadataItem,
    }: {
      objectRecordEvents: ObjectRecordEvent[];
      objectMetadataItem: EnrichedObjectMetadataItem;
    }) => {
      const objectMetadataItems = store.get(
        objectMetadataItemsWithFieldsSelector.atom,
      );

      const restoreEvents = objectRecordEvents.filter((objectRecordEvent) => {
        return objectRecordEvent.action === DatabaseEventAction.RESTORED;
      });

      const cache = apolloCoreClient.cache;

      const recordsBeforeRestore = restoreEvents.map((restoreEvent) => {
        const recordBeforeRestore = restoreEvent.properties.before;
        return {
          ...recordBeforeRestore,
          __typename: getObjectTypename(objectMetadataItem.nameSingular),
        } as RecordGqlNode;
      });

      const recordsAfterRestore = restoreEvents.map((restoreEvent) => {
        const recordAfterRestore = restoreEvent.properties.after;
        return {
          ...recordAfterRestore,
          __typename: getObjectTypename(objectMetadataItem.nameSingular),
        } as RecordGqlNode;
      });

      if (recordsAfterRestore.length === 0) {
        return;
      }

      for (const recordAfterRestore of recordsAfterRestore) {
        const recordGqlFields = {
          deletedAt: true,
        };

        updateRecordFromCache({
          objectMetadataItems,
          objectMetadataItem,
          cache: apolloCoreClient.cache,
          record: recordAfterRestore,
          recordGqlFields,
          objectPermissionsByObjectMetadataId,
        });
      }

      triggerUpdateRecordOptimisticEffectByBatch({
        cache,
        objectMetadataItem,
        objectMetadataItems,
        currentRecords: recordsBeforeRestore,
        updatedRecords: recordsAfterRestore,
        upsertRecordsInStore,
        objectPermissionsByObjectMetadataId,
      });

      debouncedRefetchAggregateQueriesForObjectMetadataItem({
        objectMetadataItem,
      });
    },
    [
      apolloCoreClient,
      store,
      objectPermissionsByObjectMetadataId,
      debouncedRefetchAggregateQueriesForObjectMetadataItem,
      upsertRecordsInStore,
    ],
  );

  return { triggerOptimisticEffectFromSseRestoreEvents };
};
