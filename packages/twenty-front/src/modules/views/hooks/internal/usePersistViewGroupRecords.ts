import { useCallback } from 'react';

import { useTriggerViewGroupOptimisticEffect } from '@/views/optimistic-effects/hooks/useTriggerViewGroupOptimisticEffect';
import { isDefined } from 'twenty-shared/utils';
import {
  type CreateCoreViewGroupMutationVariables,
  type DeleteCoreViewGroupMutationVariables,
  type DestroyCoreViewGroupMutationVariables,
  type UpdateCoreViewGroupMutationVariables,
  useCreateCoreViewGroupMutation,
  useDeleteCoreViewGroupMutation,
  useDestroyCoreViewGroupMutation,
  useUpdateCoreViewGroupMutation,
} from '~/generated/graphql';

export const usePersistViewGroupRecords = () => {
  const { triggerViewGroupOptimisticEffect } =
    useTriggerViewGroupOptimisticEffect();
  const [createCoreViewGroupMutation] = useCreateCoreViewGroupMutation();
  const [updateCoreViewGroupMutation] = useUpdateCoreViewGroupMutation();
  const [deleteCoreViewGroupMutation] = useDeleteCoreViewGroupMutation();
  const [destroyCoreViewGroupMutation] = useDestroyCoreViewGroupMutation();

  const createCoreViewGroupRecords = useCallback(
    (createCoreViewGroupInputs: CreateCoreViewGroupMutationVariables[]) => {
      if (createCoreViewGroupInputs.length === 0) {
        return;
      }

      return Promise.all(
        createCoreViewGroupInputs.map((variables) =>
          createCoreViewGroupMutation({
            variables,
            update: (_cache, { data }) => {
              const createdViewGroup = data?.createCoreViewGroup;
              if (!isDefined(createdViewGroup)) {
                return;
              }

              triggerViewGroupOptimisticEffect({
                createdViewGroups: [createdViewGroup],
              });
            },
          }),
        ),
      );
    },
    [triggerViewGroupOptimisticEffect, createCoreViewGroupMutation],
  );

  const updateCoreViewGroupRecords = useCallback(
    (updateCoreViewGroupInputs: UpdateCoreViewGroupMutationVariables[]) => {
      if (updateCoreViewGroupInputs.length === 0) {
        return;
      }

      return Promise.all(
        updateCoreViewGroupInputs.map((variables) =>
          updateCoreViewGroupMutation({
            variables,
            update: (_cache, { data }) => {
              const updatedViewGroup = data?.updateCoreViewGroup;
              if (!isDefined(updatedViewGroup)) {
                return;
              }

              triggerViewGroupOptimisticEffect({
                updatedViewGroups: [updatedViewGroup],
              });
            },
          }),
        ),
      );
    },
    [triggerViewGroupOptimisticEffect, updateCoreViewGroupMutation],
  );

  const deleteCoreViewGroupRecords = useCallback(
    (deleteCoreViewGroupInputs: DeleteCoreViewGroupMutationVariables[]) => {
      if (deleteCoreViewGroupInputs.length === 0) {
        return;
      }

      return Promise.all(
        deleteCoreViewGroupInputs.map((variables) =>
          deleteCoreViewGroupMutation({
            variables,
            update: (_cache, { data }) => {
              const deletedViewGroup = data?.deleteCoreViewGroup;
              if (!isDefined(deletedViewGroup)) {
                return;
              }

              triggerViewGroupOptimisticEffect({
                deletedViewGroups: [deletedViewGroup],
              });
            },
          }),
        ),
      );
    },
    [triggerViewGroupOptimisticEffect, deleteCoreViewGroupMutation],
  );

  const destroyCoreViewGroupRecords = useCallback(
    (destroyCoreViewGroupInputs: DestroyCoreViewGroupMutationVariables[]) => {
      if (destroyCoreViewGroupInputs.length === 0) {
        return;
      }

      return Promise.all(
        destroyCoreViewGroupInputs.map((variables) =>
          destroyCoreViewGroupMutation({
            variables,
          }),
        ),
      );
    },
    [destroyCoreViewGroupMutation],
  );

  return {
    createViewGroupRecords: createCoreViewGroupRecords,
    updateViewGroupRecords: updateCoreViewGroupRecords,
    deleteViewGroupRecords: deleteCoreViewGroupRecords,
    destroyViewGroupRecords: destroyCoreViewGroupRecords,
  };
};
