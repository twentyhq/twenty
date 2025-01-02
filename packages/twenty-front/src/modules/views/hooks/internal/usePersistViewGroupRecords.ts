import { useCallback } from 'react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useDestroyManyRecords } from '@/object-record/hooks/useDestroyManyRecords';
import { useUpdateOneRecordMutation } from '@/object-record/hooks/useUpdateOneRecordMutation';
import { GraphQLView } from '@/views/types/GraphQLView';
import { ViewGroup } from '@/views/types/ViewGroup';
import { useApolloClient } from '@apollo/client';

export const usePersistViewGroupRecords = () => {
  const apolloClient = useApolloClient();

  const { createManyRecords } = useCreateManyRecords({
    objectNameSingular: CoreObjectNameSingular.ViewGroup,
    shouldMatchRootQueryFilter: true,
  });

  const { updateOneRecordMutation } = useUpdateOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewGroup,
  });

  const { destroyManyRecords } = useDestroyManyRecords({
    objectNameSingular: CoreObjectNameSingular.ViewGroup,
  });

  const createViewGroupRecords = useCallback(
    (viewGroupsToCreate: ViewGroup[], view: GraphQLView) => {
      if (!viewGroupsToCreate.length) return;

      return createManyRecords(
        viewGroupsToCreate.map((viewGroup) => ({
          ...viewGroup,
          view: {
            id: view.id,
          },
        })),
      );
    },
    [createManyRecords],
  );

  const updateViewGroupRecords = useCallback(
    async (viewGroupsToUpdate: ViewGroup[]) => {
      if (!viewGroupsToUpdate.length) return;

      const mutationPromises = viewGroupsToUpdate.map((viewGroup) =>
        apolloClient.mutate<{ updateViewGroup: ViewGroup }>({
          mutation: updateOneRecordMutation,
          variables: {
            idToUpdate: viewGroup.id,
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
        const record = data?.['updateViewGroup'];

        if (!record) return;

        apolloClient.cache.modify({
          id: apolloClient.cache.identify({
            __typename: 'ViewGroup',
            id: record.id,
          }),
          fields: {
            isVisible: () => record.isVisible,
            position: () => record.position,
          },
        });
      });
    },
    [apolloClient, updateOneRecordMutation],
  );

  const deleteViewGroupRecords = useCallback(
    async (viewGroupsToDelete: ViewGroup[]) => {
      if (!viewGroupsToDelete.length) return;

      return destroyManyRecords(
        viewGroupsToDelete.map((viewGroup) => viewGroup.id),
      );
    },
    [destroyManyRecords],
  );

  return {
    createViewGroupRecords,
    updateViewGroupRecords,
    deleteViewGroupRecords,
  };
};
