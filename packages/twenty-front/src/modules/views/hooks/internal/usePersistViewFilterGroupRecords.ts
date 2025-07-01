import { useCallback } from 'react';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useCreateOneRecordMutation } from '@/object-record/hooks/useCreateOneRecordMutation';
import { useDestroyOneRecordMutation } from '@/object-record/hooks/useDestroyOneRecordMutation';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpdateOneRecordMutation } from '@/object-record/hooks/useUpdateOneRecordMutation';
import { GraphQLView } from '@/views/types/GraphQLView';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { isDefined } from 'twenty-shared/utils';

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
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const apolloCoreClient = useApolloCoreClient();

  const createViewFilterGroupRecord = useCallback(
    async (viewFilterGroup: ViewFilterGroup, view: GraphQLView) => {
      const result = await apolloCoreClient.mutate<{
        createViewFilterGroup: ViewFilterGroup;
      }>({
        mutation: createOneRecordMutation,
        variables: {
          input: {
            id: viewFilterGroup.id,
            viewId: view.id,
            parentViewFilterGroupId: viewFilterGroup.parentViewFilterGroupId,
            logicalOperator: viewFilterGroup.logicalOperator,
            positionInViewFilterGroup:
              viewFilterGroup.positionInViewFilterGroup,
          },
        },
        update: (cache, { data }) => {
          const record = data?.createViewFilterGroup;
          if (!isDefined(record)) return;

          triggerCreateRecordsOptimisticEffect({
            cache,
            objectMetadataItem,
            recordsToCreate: [record],
            objectMetadataItems,
            objectPermissionsByObjectMetadataId,
          });
        },
      });

      if (!result.data) {
        throw new Error('Failed to create view filter group');
      }

      return { newRecordId: result.data.createViewFilterGroup.id };
    },
    [
      apolloCoreClient,
      createOneRecordMutation,
      objectMetadataItem,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    ],
  );

  const createViewFilterGroupRecords = useCallback(
    async (viewFilterGroupsToCreate: ViewFilterGroup[], view: GraphQLView) => {
      if (!viewFilterGroupsToCreate.length) return [];

      const oldToNewId = new Map<string, string>();

      for (const viewFilterGroupToCreate of viewFilterGroupsToCreate) {
        const newParentViewFilterGroupId = isDefined(
          viewFilterGroupToCreate.parentViewFilterGroupId,
        )
          ? (oldToNewId.get(viewFilterGroupToCreate.parentViewFilterGroupId) ??
            viewFilterGroupToCreate.parentViewFilterGroupId)
          : undefined;

        const { newRecordId } = await createViewFilterGroupRecord(
          {
            ...viewFilterGroupToCreate,
            parentViewFilterGroupId: newParentViewFilterGroupId,
          },
          view,
        );

        oldToNewId.set(viewFilterGroupToCreate.id, newRecordId);
      }

      const newRecordIds = viewFilterGroupsToCreate.map((viewFilterGroup) => {
        const newId = oldToNewId.get(viewFilterGroup.id);
        if (!newId) {
          throw new Error('Failed to create view filter group');
        }
        return newId;
      });

      return newRecordIds;
    },
    [createViewFilterGroupRecord],
  );

  const updateViewFilterGroupRecords = useCallback(
    (viewFilterGroupsToUpdate: ViewFilterGroup[]) => {
      if (!viewFilterGroupsToUpdate.length) return;
      return Promise.all(
        viewFilterGroupsToUpdate.map((viewFilterGroup) =>
          apolloCoreClient.mutate<{ updateViewFilterGroup: ViewFilterGroup }>({
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
              if (!isDefined(record)) return;

              const cachedRecord = getRecordFromCache<ViewFilterGroup>(
                record.id,
                cache,
              );
              if (!isDefined(cachedRecord)) return;

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
      apolloCoreClient,
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
          apolloCoreClient.mutate<{ destroyViewFilterGroup: ViewFilterGroup }>({
            mutation: destroyOneRecordMutation,
            variables: {
              idToDestroy: viewFilterGroupId,
            },
            update: (cache, { data }) => {
              const record = data?.destroyViewFilterGroup;
              if (!isDefined(record)) return;

              const cachedRecord = getRecordFromCache(record.id, cache);
              if (!isDefined(cachedRecord)) return;

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
      apolloCoreClient,
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
