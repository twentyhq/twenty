import { useCallback } from 'react';

import { CREATE_CORE_VIEW_GROUP } from '@/views/graphql/mutations/createCoreViewGroup';
import { DESTROY_CORE_VIEW_GROUP } from '@/views/graphql/mutations/destroyCoreViewGroup';
import { UPDATE_CORE_VIEW_GROUP } from '@/views/graphql/mutations/updateCoreViewGroup';
import { useTriggerViewGroupOptimisticEffect } from '@/views/optimistic-effects/hooks/useTriggerViewGroupOptimisticEffect';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { useApolloClient } from '@apollo/client';
import { type CoreViewGroup } from '~/generated/graphql';

type CreateViewGroupRecordsArgs = {
  viewGroupsToCreate: ViewGroup[];
  viewId: string;
};

export const usePersistViewGroupRecords = () => {
  const apolloClient = useApolloClient();

  const { triggerViewGroupOptimisticEffect } =
    useTriggerViewGroupOptimisticEffect();

  const createCoreViewGroupRecords = useCallback(
    ({ viewGroupsToCreate, viewId }: CreateViewGroupRecordsArgs) => {
      if (viewGroupsToCreate.length === 0) return;

      return Promise.all(
        viewGroupsToCreate.map((viewGroup) =>
          apolloClient.mutate({
            mutation: CREATE_CORE_VIEW_GROUP,
            variables: {
              input: {
                id: viewGroup.id,
                viewId,
                fieldMetadataId: viewGroup.fieldMetadataId,
                fieldValue: viewGroup.fieldValue,
                isVisible: viewGroup.isVisible,
                position: viewGroup.position,
              },
            },
            update: (_cache, { data }) => {
              const record = data?.['createCoreViewGroup'];
              if (!record) return;

              triggerViewGroupOptimisticEffect({
                createdViewGroups: [record],
              });
            },
          }),
        ),
      );
    },
    [apolloClient, triggerViewGroupOptimisticEffect],
  );

  const updateCoreViewGroupRecords = useCallback(
    async (viewGroupsToUpdate: ViewGroup[]) => {
      if (!viewGroupsToUpdate.length) return;

      const mutationPromises = viewGroupsToUpdate.map((viewGroup) =>
        apolloClient.mutate<{ updateCoreViewGroup: CoreViewGroup }>({
          mutation: UPDATE_CORE_VIEW_GROUP,
          variables: {
            id: viewGroup.id,
            input: {
              isVisible: viewGroup.isVisible,
              position: viewGroup.position,
            },
          },
          // Avoid cache being updated with stale data
          fetchPolicy: 'no-cache',
          update: (_cache, { data }) => {
            const record = data?.['updateCoreViewGroup'];
            if (!record) return;

            triggerViewGroupOptimisticEffect({
              updatedViewGroups: [record],
            });
          },
        }),
      );

      return Promise.all(mutationPromises);
    },
    [apolloClient, triggerViewGroupOptimisticEffect],
  );

  const deleteCoreViewGroupRecords = useCallback(
    async (viewGroupsToDelete: Pick<CoreViewGroup, 'id' | 'viewId'>[]) => {
      if (!viewGroupsToDelete.length) return;

      return Promise.all(
        viewGroupsToDelete.map((viewGroup) =>
          apolloClient.mutate({
            mutation: DESTROY_CORE_VIEW_GROUP,
            variables: {
              id: viewGroup.id,
            },
            update: () => {
              triggerViewGroupOptimisticEffect({
                deletedViewGroups: [viewGroup],
              });
            },
          }),
        ),
      );
    },
    [apolloClient, triggerViewGroupOptimisticEffect],
  );

  return {
    createViewGroupRecords: createCoreViewGroupRecords,
    updateViewGroupRecords: updateCoreViewGroupRecords,
    deleteViewGroupRecords: deleteCoreViewGroupRecords,
  };
};
