import { useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useCreateOneRecordMutation } from '@/object-record/hooks/useCreateOneRecordMutation';
import { useDestroyOneRecordMutation } from '@/object-record/hooks/useDestroyOneRecordMutation';
import { useUpdateOneRecordMutation } from '@/object-record/hooks/useUpdateOneRecordMutation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { GraphQLView } from '@/views/types/GraphQLView';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';

export const usePersistViewFilterGroupRecords = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ViewFilterGroup,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.ViewFilterGroup,
  });

  const { destroyOneRecordMutation } = useDestroyOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewFilterGroup,
  });

  const { createOneRecordMutation } = useCreateOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewFilterGroup,
  });

  const { updateOneRecordMutation } = useUpdateOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewFilterGroup,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const apolloClient = useApolloClient();

  const createViewFilterGroupRecords = useCallback(
    (viewFilterGroupsToCreate: ViewFilterGroup[], view: GraphQLView) => {
      if (!viewFilterGroupsToCreate.length) return;

      return Promise.all(
        viewFilterGroupsToCreate.map((viewFilterGroup) =>
          apolloClient.mutate<{ createViewFilterGroup: ViewFilterGroup }>({
            mutation: createOneRecordMutation,
            variables: {
              input: {
                viewId: view.id,
                parentViewFilterGroupId:
                  viewFilterGroup.parentViewFilterGroupId,
                logicalOperator: viewFilterGroup.logicalOperator,
                positionInViewFilterGroup:
                  viewFilterGroup.positionInViewFilterGroup,
              },
            },
            update: (cache, { data }) => {
              const record = data?.createViewFilterGroup;
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

  const updateViewFilterGroupRecords = useCallback(
    (viewFilterGroupsToUpdate: ViewFilterGroup[]) => {
      if (!viewFilterGroupsToUpdate.length) return;
      return Promise.all(
        viewFilterGroupsToUpdate.map((viewFilterGroup) =>
          apolloClient.mutate<{ updateViewFilterGroup: ViewFilterGroup }>({
            mutation: updateOneRecordMutation,
            variables: {
              idToUpdate: viewFilterGroup.id,
              input: {
                parentViewFilterGroupId:
                  viewFilterGroup.parentViewFilterGroupId,
                logicalOperator: viewFilterGroup.logicalOperator,
                positionInViewFilterGroup:
                  viewFilterGroup.positionInViewFilterGroup,
              },
            },
            update: (cache, { data }) => {
              const record = data?.updateViewFilterGroup;
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

  const deleteViewFilterGroupRecords = useCallback(
    (viewFilterGroupIdsToDelete: string[]) => {
      if (!viewFilterGroupIdsToDelete.length) return;
      return Promise.all(
        viewFilterGroupIdsToDelete.map((viewFilterGroupId) =>
          apolloClient.mutate<{ destroyViewFilterGroup: ViewFilterGroup }>({
            mutation: destroyOneRecordMutation,
            variables: {
              idToDestroy: viewFilterGroupId,
            },
            update: (cache, { data }) => {
              const record = data?.destroyViewFilterGroup;

              if (!record) return;

              const cachedRecord = getRecordFromCache(record.id, cache);

              if (!cachedRecord) return;

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
      getRecordFromCache,
      objectMetadataItem,
      objectMetadataItems,
    ],
  );

  return {
    createViewFilterGroupRecords,
    updateViewFilterGroupRecords,
    deleteViewFilterGroupRecords,
  };
};
