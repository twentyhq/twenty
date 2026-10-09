import { type RecordGqlFields } from 'twenty-shared/types';
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

export const useTriggerOptimisticEffectFromSseDeleteEvents = () => {
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { refetchAggregateQueriesForObjectMetadataItem } =
    useRefetchAggregateQueriesForObjectMetadataItem();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const debouncedRefetchAggregateQueriesForObjectMetadataItem =
    useDebouncedCallback(refetchAggregateQueriesForObjectMetadataItem, 100);

  const triggerOptimisticEffectFromSseDeleteEvents = useCallback(
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

      const deleteEvents = objectRecordEvents.filter((objectRecordEvent) => {
        return objectRecordEvent.action === DatabaseEventAction.DELETED;
      });

      const cache = apolloCoreClient.cache;

      const recordsBeforeDelete = deleteEvents.map((deleteEvent) => {
        const recordBeforeDelete = deleteEvent.properties.before;

        return {
          ...recordBeforeDelete,
          __typename: getObjectTypename(objectMetadataItem.nameSingular),
        } as RecordGqlNode;
      });

      const recordsAfterDelete = deleteEvents.map((deleteEvent) => {
        const recordAfterDelete = deleteEvent.properties.after;

        return {
          ...recordAfterDelete,
          __typename: getObjectTypename(objectMetadataItem.nameSingular),
        } as RecordGqlNode;
      });

      if (recordsAfterDelete.length === 0) {
        return;
      }

      for (const recordAfterDelete of recordsAfterDelete) {
        const recordGqlFields: RecordGqlFields = {
          deletedAt: true,
        };

        updateRecordFromCache({
          objectMetadataItems,
          objectMetadataItem,
          cache: apolloCoreClient.cache,
          record: recordAfterDelete,
          recordGqlFields,
          objectPermissionsByObjectMetadataId,
        });
      }

      triggerUpdateRecordOptimisticEffectByBatch({
        cache,
        objectMetadataItem,
        objectMetadataItems,
        currentRecords: recordsBeforeDelete,
        updatedRecords: recordsAfterDelete,
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

  return { triggerOptimisticEffectFromSseDeleteEvents };
};
