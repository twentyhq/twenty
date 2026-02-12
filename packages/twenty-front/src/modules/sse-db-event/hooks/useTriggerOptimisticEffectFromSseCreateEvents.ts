import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueriesForObjectMetadataItem } from '@/object-record/hooks/useRefetchAggregateQueriesForObjectMetadataItem';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  DatabaseEventAction,
  type ObjectRecordEvent,
} from '~/generated-metadata/graphql';

export const useTriggerOptimisticEffectFromSseCreateEvents = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { refetchAggregateQueriesForObjectMetadataItem } =
    useRefetchAggregateQueriesForObjectMetadataItem();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const debouncedRefetchAggregateQueriesForObjectMetadataItem =
    useDebouncedCallback(refetchAggregateQueriesForObjectMetadataItem, 100);

  const triggerOptimisticEffectFromSseCreateEvents = useCallback(
    ({
      objectRecordEvents,
      objectMetadataItem,
    }: {
      objectRecordEvents: ObjectRecordEvent[];
      objectMetadataItem: ObjectMetadataItem;
    }) => {
      const createEvents = objectRecordEvents.filter((objectRecordEvent) => {
        return objectRecordEvent.action === DatabaseEventAction.CREATED;
      });

      const cache = apolloCoreClient.cache;

      const recordsToCreate = createEvents.map((createEvent) => {
        return {
          ...createEvent.properties.after,
          __typename: getObjectTypename(objectMetadataItem.nameSingular),
        } as RecordGqlNode;
      });

      triggerCreateRecordsOptimisticEffect({
        cache,
        objectMetadataItem,
        recordsToCreate: recordsToCreate,
        objectMetadataItems,
        shouldMatchRootQueryFilter: true,
        checkForRecordInCache: true,
        objectPermissionsByObjectMetadataId,
        upsertRecordsInStore,
      });

      debouncedRefetchAggregateQueriesForObjectMetadataItem({
        objectMetadataItem,
      });
    },
    [
      apolloCoreClient.cache,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
      upsertRecordsInStore,
      debouncedRefetchAggregateQueriesForObjectMetadataItem,
    ],
  );

  return {
    triggerOptimisticEffectFromSseCreateEvents,
  };
};
