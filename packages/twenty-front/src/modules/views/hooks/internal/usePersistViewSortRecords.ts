import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useCreateOneRecordMutation } from '@/object-record/hooks/useCreateOneRecordMutation';
import { useDeleteOneRecordMutation } from '@/object-record/hooks/useDeleteOneRecordMutation';
import { useUpdateOneRecordMutation } from '@/object-record/hooks/useUpdateOneRecordMutation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { GraphQLView } from '@/views/types/GraphQLView';
import { ViewSort } from '@/views/types/ViewSort';

export const usePersistViewSortRecords = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ViewSort,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.ViewSort,
  });

  const { deleteOneRecordMutation } = useDeleteOneRecordMutation({
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
              if (!record) return;
              const cachedRecord = getRecordFromCache<ObjectRecord>(record.id);

              if (!cachedRecord) return;

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
      getRecordFromCache,
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
            mutation: deleteOneRecordMutation,
            variables: {
              idToDelete: viewSortId,
            },
            update: (cache, { data }) => {
              const record = data?.['deleteViewSort'];

              if (!record) return;

              const cachedRecord = getRecordFromCache(record.id, cache);

              if (!cachedRecord) return;

              triggerDeleteRecordsOptimisticEffect({
                cache,
                objectMetadataItem,
                recordsToDelete: [cachedRecord],
                objectMetadataItems,
              });
            },
          }),
        ),
      );
    },
    [
      apolloClient,
      deleteOneRecordMutation,
      getRecordFromCache,
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
