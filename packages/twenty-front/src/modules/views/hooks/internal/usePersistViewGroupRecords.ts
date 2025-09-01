import { useCallback } from 'react';

import { CREATE_CORE_VIEW_GROUP } from '@/views/graphql/mutations/createCoreViewGroup';
import { DESTROY_CORE_VIEW_GROUP } from '@/views/graphql/mutations/destroyCoreViewGroup';
import { UPDATE_CORE_VIEW_GROUP } from '@/views/graphql/mutations/updateCoreViewGroup';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { useApolloClient } from '@apollo/client';

type CreateViewGroupRecordsArgs = {
  viewGroupsToCreate: ViewGroup[];
  viewId: string;
};

export const usePersistViewGroupRecords = () => {
  const apolloClient = useApolloClient();

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
          }),
        ),
      );
    },
    [apolloClient],
  );

  const updateCoreViewGroupRecords = useCallback(
    async (viewGroupsToUpdate: ViewGroup[]) => {
      if (!viewGroupsToUpdate.length) return;

      const mutationPromises = viewGroupsToUpdate.map((viewGroup) =>
        apolloClient.mutate<{ updateCoreViewGroup: ViewGroup }>({
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
        }),
      );

      const mutationResults = await Promise.all(mutationPromises);

      // FixMe: Using useUpdateOneRecord hook that call triggerUpdateRecordsOptimisticEffect is actaully causing multiple records to be created
      // This is a temporary fix
      mutationResults.forEach(({ data }) => {
        const record = data?.['updateCoreViewGroup'];

        if (!record) return;

        apolloClient.cache.modify({
          id: apolloClient.cache.identify({
            __typename: 'CoreViewGroup',
            id: record.id,
          }),
          fields: {
            isVisible: () => record.isVisible,
            position: () => record.position,
          },
        });
      });
    },
    [apolloClient],
  );

  const deleteCoreViewGroupRecords = useCallback(
    async (viewGroupsToDelete: ViewGroup[]) => {
      if (!viewGroupsToDelete.length) return;

      return Promise.all(
        viewGroupsToDelete.map((viewGroup) =>
          apolloClient.mutate({
            mutation: DESTROY_CORE_VIEW_GROUP,
            variables: {
              id: viewGroup.id,
            },
          }),
        ),
      );
    },
    [apolloClient],
  );

  return {
    createViewGroupRecords: createCoreViewGroupRecords,
    updateViewGroupRecords: updateCoreViewGroupRecords,
    deleteViewGroupRecords: deleteCoreViewGroupRecords,
  };
};
