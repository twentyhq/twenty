import { useCallback } from 'react';

import { useTriggerViewFilterOptimisticEffect } from '@/views/optimistic-effects/hooks/useTriggerViewFilterOptimisticEffect';
import { isDefined } from 'twenty-shared/utils';
import {
  type CreateCoreViewFilterMutationVariables,
  type DeleteCoreViewFilterMutationVariables,
  type DestroyCoreViewFilterMutationVariables,
  type UpdateCoreViewFilterMutationVariables,
  useCreateCoreViewFilterMutation,
  useDeleteCoreViewFilterMutation,
  useDestroyCoreViewFilterMutation,
  useUpdateCoreViewFilterMutation,
} from '~/generated/graphql';

export const usePersistViewFilterRecords = () => {
  const { triggerViewFilterOptimisticEffect } =
    useTriggerViewFilterOptimisticEffect();
  const [createCoreViewFilterMutation] = useCreateCoreViewFilterMutation();
  const [updateCoreViewFilterMutation] = useUpdateCoreViewFilterMutation();
  const [deleteCoreViewFilterMutation] = useDeleteCoreViewFilterMutation();
  const [destroyCoreViewFilterMutation] = useDestroyCoreViewFilterMutation();

  const createCoreViewFilterRecords = useCallback(
    (createCoreViewFilterInputs: CreateCoreViewFilterMutationVariables[]) => {
      if (createCoreViewFilterInputs.length === 0) {
        return;
      }

      return Promise.all(
        createCoreViewFilterInputs.map(async (variables) =>
          createCoreViewFilterMutation({
            variables,
            update: (_cache, { data }) => {
              const createdViewFilter = data?.createCoreViewFilter;
              if (!isDefined(createdViewFilter)) {
                return;
              }

              triggerViewFilterOptimisticEffect({
                createdViewFilters: [createdViewFilter],
              });
            },
          }),
        ),
      );
    },
    [triggerViewFilterOptimisticEffect, createCoreViewFilterMutation],
  );

  const updateCoreViewFilterRecords = useCallback(
    (updateCoreViewFilterInputs: UpdateCoreViewFilterMutationVariables[]) => {
      if (updateCoreViewFilterInputs.length === 0) {
        return;
      }

      return Promise.all(
        updateCoreViewFilterInputs.map((variables) =>
          updateCoreViewFilterMutation({
            variables,
            update: (_cache, { data }) => {
              const updatedViewFilter = data?.updateCoreViewFilter;
              if (!isDefined(updatedViewFilter)) {
                return;
              }

              triggerViewFilterOptimisticEffect({
                updatedViewFilters: [updatedViewFilter],
              });
            },
          }),
        ),
      );
    },
    [triggerViewFilterOptimisticEffect, updateCoreViewFilterMutation],
  );

  const deleteCoreViewFilterRecords = useCallback(
    (deleteCoreViewFilterInputs: DeleteCoreViewFilterMutationVariables[]) => {
      if (deleteCoreViewFilterInputs.length === 0) {
        return;
      }

      return Promise.all(
        deleteCoreViewFilterInputs.map((variables) =>
          deleteCoreViewFilterMutation({
            variables,
            update: (_cache, { data }) => {
              const deletedViewFilter = data?.deleteCoreViewFilter;
              if (!isDefined(deletedViewFilter)) {
                return;
              }

              triggerViewFilterOptimisticEffect({
                deletedViewFilters: [deletedViewFilter],
              });
            },
          }),
        ),
      );
    },
    [triggerViewFilterOptimisticEffect, deleteCoreViewFilterMutation],
  );

  const destroyCoreViewFilterRecords = useCallback(
    (destroyCoreViewFilterInputs: DestroyCoreViewFilterMutationVariables[]) => {
      if (destroyCoreViewFilterInputs.length === 0) {
        return;
      }

      return Promise.all(
        destroyCoreViewFilterInputs.map((variables) =>
          destroyCoreViewFilterMutation({
            variables,
          }),
        ),
      );
    },
    [destroyCoreViewFilterMutation],
  );

  return {
    createViewFilterRecords: createCoreViewFilterRecords,
    updateViewFilterRecords: updateCoreViewFilterRecords,
    deleteViewFilterRecords: deleteCoreViewFilterRecords,
    destroyViewFilterRecords: destroyCoreViewFilterRecords,
  };
};
