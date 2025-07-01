import { useCallback } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useDestroyManyRecords } from '@/object-record/hooks/useDestroyManyRecords';
import { useUpdateOneRecordMutation } from '@/object-record/hooks/useUpdateOneRecordMutation';
import { ViewGroup } from '@/views/types/ViewGroup';

type CreateViewGroupRecordsArgs = {
  viewGroupsToCreate: ViewGroup[];
  viewId: string;
};
export const usePersistViewGroupRecords = () => {
  const apolloCoreClient = useApolloCoreClient();

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
    ({ viewGroupsToCreate, viewId }: CreateViewGroupRecordsArgs) => {
      if (viewGroupsToCreate.length === 0) return;

      return createManyRecords({
        recordsToCreate: viewGroupsToCreate.map((viewGroup) => ({
          ...viewGroup,
          viewId,
        })),
      });
    },
    [createManyRecords],
  );

  const updateViewGroupRecords = useCallback(
    async (viewGroupsToUpdate: ViewGroup[]) => {
      if (!viewGroupsToUpdate.length) return;

      const mutationPromises = viewGroupsToUpdate.map((viewGroup) =>
        apolloCoreClient.mutate<{ updateViewGroup: ViewGroup }>({
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

        apolloCoreClient.cache.modify({
          id: apolloCoreClient.cache.identify({
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
    [apolloCoreClient, updateOneRecordMutation],
  );

  const deleteViewGroupRecords = useCallback(
    async (viewGroupsToDelete: ViewGroup[]) => {
      if (!viewGroupsToDelete.length) return;

      const recordIdsToDestroy = viewGroupsToDelete.map(
        (viewGroup) => viewGroup.id,
      );
      return destroyManyRecords({
        recordIdsToDestroy,
      });
    },
    [destroyManyRecords],
  );

  return {
    createViewGroupRecords,
    updateViewGroupRecords,
    deleteViewGroupRecords,
  };
};
