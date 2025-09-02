import { useCallback } from 'react';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { CREATE_CORE_VIEW_FILTER_GROUP } from '@/views/graphql/mutations/createCoreViewFilterGroup';
import { DESTROY_CORE_VIEW_FILTER_GROUP } from '@/views/graphql/mutations/destroyCoreViewFilterGroup';
import { UPDATE_CORE_VIEW_FILTER_GROUP } from '@/views/graphql/mutations/updateCoreViewFilterGroup';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { useApolloClient } from '@apollo/client';
import { isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type CoreViewFilterGroup } from '~/generated/graphql';

export const usePersistViewFilterGroupRecords = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ViewFilterGroup,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.ViewFilterGroup,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const apolloClient = useApolloClient();

  const createCoreViewFilterGroupRecord = useCallback(
    async (viewFilterGroup: ViewFilterGroup, view: Pick<GraphQLView, 'id'>) => {
      const result = await apolloClient.mutate<{
        createCoreViewFilterGroup: ViewFilterGroup;
      }>({
        mutation: CREATE_CORE_VIEW_FILTER_GROUP,
        variables: {
          input: {
            id: viewFilterGroup.id,
            viewId: view.id,
            parentViewFilterGroupId: viewFilterGroup.parentViewFilterGroupId,
            logicalOperator: viewFilterGroup.logicalOperator,
            positionInViewFilterGroup:
              viewFilterGroup.positionInViewFilterGroup,
          } satisfies Partial<CoreViewFilterGroup>,
        },
        update: (cache, { data }) => {
          const record = data?.createCoreViewFilterGroup;
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
        throw new Error('Failed to create core view filter group');
      }

      return { newRecordId: result.data.createCoreViewFilterGroup.id };
    },
    [
      apolloClient,
      objectMetadataItem,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    ],
  );

  const createCoreViewFilterGroupRecords = useCallback(
    async (
      viewFilterGroupsToCreate: ViewFilterGroup[],
      view: Pick<GraphQLView, 'id'>,
    ) => {
      if (!viewFilterGroupsToCreate.length) return [];

      const oldToNewId = new Map<string, string>();

      for (const viewFilterGroupToCreate of viewFilterGroupsToCreate) {
        const newParentViewFilterGroupId = isDefined(
          viewFilterGroupToCreate.parentViewFilterGroupId,
        )
          ? (oldToNewId.get(viewFilterGroupToCreate.parentViewFilterGroupId) ??
            viewFilterGroupToCreate.parentViewFilterGroupId)
          : undefined;

        const { newRecordId } = await createCoreViewFilterGroupRecord(
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
          throw new Error('Failed to create core view filter group');
        }
        return newId;
      });

      return newRecordIds;
    },
    [createCoreViewFilterGroupRecord],
  );

  const updateCoreViewFilterGroupRecords = useCallback(
    (viewFilterGroupsToUpdate: ViewFilterGroup[]) => {
      if (!viewFilterGroupsToUpdate.length) return;
      return Promise.all(
        viewFilterGroupsToUpdate.map((viewFilterGroup) =>
          apolloClient.mutate<{ updateCoreViewFilterGroup: ViewFilterGroup }>({
            mutation: UPDATE_CORE_VIEW_FILTER_GROUP,
            variables: {
              id: viewFilterGroup.id,
              input: {
                parentViewFilterGroupId:
                  viewFilterGroup.parentViewFilterGroupId,
                logicalOperator: viewFilterGroup.logicalOperator,
                positionInViewFilterGroup:
                  viewFilterGroup.positionInViewFilterGroup,
              } satisfies Partial<CoreViewFilterGroup>,
            },
            update: (cache, { data }) => {
              const record = data?.updateCoreViewFilterGroup;
              if (!isDefined(record)) return;

              const cachedRecord = getRecordFromCache<ViewFilterGroup>(
                record.id,
                cache,
              );
              if (isNull(cachedRecord)) return;

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
    [apolloClient, getRecordFromCache, objectMetadataItem, objectMetadataItems],
  );

  const deleteCoreViewFilterGroupRecords = useCallback(
    (viewFilterGroupIdsToDelete: string[]) => {
      if (!viewFilterGroupIdsToDelete.length) return;
      return Promise.all(
        viewFilterGroupIdsToDelete.map((viewFilterGroupId) =>
          apolloClient.mutate<{ destroyCoreViewFilterGroup: ViewFilterGroup }>({
            mutation: DESTROY_CORE_VIEW_FILTER_GROUP,
            variables: {
              id: viewFilterGroupId,
            },
            update: (cache, { data }) => {
              const record = data?.destroyCoreViewFilterGroup;
              if (!isDefined(record)) return;

              const cachedRecord = getRecordFromCache(record.id, cache);
              if (isNull(cachedRecord)) return;

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
    [apolloClient, getRecordFromCache, objectMetadataItem, objectMetadataItems],
  );

  return {
    createViewFilterGroupRecords: createCoreViewFilterGroupRecords,
    updateViewFilterGroupRecords: updateCoreViewFilterGroupRecords,
    deleteViewFilterGroupRecords: deleteCoreViewFilterGroupRecords,
  };
};
