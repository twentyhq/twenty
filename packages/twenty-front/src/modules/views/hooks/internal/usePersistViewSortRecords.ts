import { useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCacheOrMinimalRecord } from '@/object-record/cache/hooks/useGetRecordFromCacheOrMinimalRecord';
import { useCreateOneRecordMutation } from '@/object-record/hooks/useCreateOneRecordMutation';
import { useDestroyOneRecordMutation } from '@/object-record/hooks/useDestroyOneRecordMutation';
import { useUpdateOneRecordMutation } from '@/object-record/hooks/useUpdateOneRecordMutation';
import { GraphQLView } from '@/views/types/GraphQLView';
import { ViewSort } from '@/views/types/ViewSort';
import { isDefined } from 'twenty-shared';

export const usePersistViewSortRecords = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ViewSort,
  });

  const getRecordFromCacheOrMinimalRecord =
    useGetRecordFromCacheOrMinimalRecord({
      objectNameSingular: CoreObjectNameSingular.ViewSort,
    });

  const { destroyOneRecordMutation } = useDestroyOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewSort,
  });

  const { createOneRecordMutation } = useCreateOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewSort,
  });

  const { updateOneRecordMutation } = useUpdateOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewSort,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const apolloClient = useApolloClient();

  const createViewSortRecords = useCallback(
    (viewSortsToCreate: ViewSort[], view: GraphQLView) => {
      if (!viewSortsToCreate.length) return;
      return Promise.all(
        viewSortsToCreate.map((viewSort) =>
          apolloClient.mutate({
            mutation: createOneRecordMutation,
            variables: {
              input: {
                fieldMetadataId: viewSort.fieldMetadataId,
                viewId: view.id,
                direction: viewSort.direction,
              },
            },
            update: (cache, { data }) => {
              const record = data?.['createViewSort'];
              if (!record) return;

              triggerCreateRecordsOptimisticEffect({
                cache,
                objectMetadataItem,
                recordsToCreate: [record],
                objectMetadataItems,
              });
            },
          }),
        ),
      );
    },
    [
      apolloClient,
      createOneRecordMutation,
      objectMetadataItem,
      objectMetadataItems,
    ],
  );

  const updateViewSortRecords = useCallback(
    (viewSortsToUpdate: ViewSort[]) => {
      if (!viewSortsToUpdate.length) return;
      return Promise.all(
        viewSortsToUpdate.map((viewSort) =>
          apolloClient.mutate({
            mutation: updateOneRecordMutation,
            variables: {
              idToUpdate: viewSort.id,
              input: {
                direction: viewSort.direction,
              },
            },
            update: (cache, { data }) => {
              const record = data?.['updateViewSort'];
              if (!isDefined(record)) return;

              const cachedRecord = getRecordFromCacheOrMinimalRecord<ViewSort>(
                record.id,
                cache,
              );
              triggerUpdateRecordOptimisticEffect({
                cache,
                objectMetadataItem,
                currentRecord: cachedRecord,
                updatedRecord: record,
                objectMetadataItems,
              });
            },
          }),
        ),
      );
    },
    [
      apolloClient,
      getRecordFromCacheOrMinimalRecord,
      objectMetadataItem,
      objectMetadataItems,
      updateOneRecordMutation,
    ],
  );

  const deleteViewSortRecords = useCallback(
    (viewSortIdsToDelete: string[]) => {
      if (!viewSortIdsToDelete.length) return;
      return Promise.all(
        viewSortIdsToDelete.map((viewSortId) =>
          apolloClient.mutate({
            mutation: destroyOneRecordMutation,
            variables: {
              idToDestroy: viewSortId,
            },
            update: (cache, { data }) => {
              const record = data?.['destroyViewSort'];
              if (!isDefined(record)) return;

              const cachedRecord = getRecordFromCacheOrMinimalRecord(
                record.id,
                cache,
              );
              triggerDestroyRecordsOptimisticEffect({
                cache,
                objectMetadataItem,
                recordsToDestroy: [cachedRecord],
                objectMetadataItems,
              });
            },
          }),
        ),
      );
    },
    [
      apolloClient,
      destroyOneRecordMutation,
      getRecordFromCacheOrMinimalRecord,
      objectMetadataItem,
      objectMetadataItems,
    ],
  );

  return {
    createViewSortRecords,
    updateViewSortRecords,
    deleteViewSortRecords,
  };
};
