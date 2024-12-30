import { useCallback } from 'react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useDestroyManyRecords } from '@/object-record/hooks/useDestroyManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { GraphQLView } from '@/views/types/GraphQLView';
import { ViewGroup } from '@/views/types/ViewGroup';

export const usePersistViewGroupRecords = () => {
  const { createManyRecords } = useCreateManyRecords({
    objectNameSingular: CoreObjectNameSingular.ViewGroup,
    shouldMatchRootQueryFilter: true,
  });

  const { updateOneRecord } = useUpdateOneRecord({
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

      return Promise.all(
        viewGroupsToUpdate.map((viewGroup) =>
          updateOneRecord({
            idToUpdate: viewGroup.id,
            updateOneRecordInput: {
              isVisible: viewGroup.isVisible,
              position: viewGroup.position,
            },
          }),
        ),
      );
    },
    [updateOneRecord],
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
