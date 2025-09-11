import { useCallback } from 'react';

import { useTriggerViewFieldOptimisticEffect } from '@/views/optimistic-effects/hooks/useTriggerViewFieldOptimisticEffect';
import { useApolloClient } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import {
  CreateCoreViewFieldMutationVariables,
  DeleteCoreViewFieldMutationVariables,
  DestroyCoreViewFieldMutationVariables,
  UpdateCoreViewFieldMutationVariables,
  useCreateCoreViewFieldMutation,
  useDeleteCoreViewFieldMutation,
  useDestroyCoreViewFieldMutation,
  useUpdateCoreViewFieldMutation,
} from '~/generated/graphql';

export const usePersistViewFieldRecords = () => {
  const apolloClient = useApolloClient();

  const { triggerViewFieldOptimisticEffect } =
    useTriggerViewFieldOptimisticEffect();
  const [createCoreViewFieldMutation] = useCreateCoreViewFieldMutation();
  const [updateCoreViewFieldMutation] = useUpdateCoreViewFieldMutation();
  const [deleteCoreViewFieldMutation] = useDeleteCoreViewFieldMutation();
  const [destroyCoreViewFieldMutation] = useDestroyCoreViewFieldMutation();

  const createCoreViewFieldRecords = useCallback(
    (createCoreViewFieldInputs: CreateCoreViewFieldMutationVariables[]) => {
      if (createCoreViewFieldInputs.length === 0) {
        return;
      }

      return Promise.all(
        createCoreViewFieldInputs.map(async (variables) =>
          createCoreViewFieldMutation({
            variables,
            update: (_cache, { data }) => {
              const createdViewField = data?.createCoreViewField;
              if (!isDefined(createdViewField)) {
                return;
              }

              triggerViewFieldOptimisticEffect({
                createdViewFields: [createdViewField],
              });
            },
          }),
        ),
      );
    },
    [apolloClient, triggerViewFieldOptimisticEffect],
  );

  const updateCoreViewFieldRecords = useCallback(
    (createCoreViewFieldInputs: UpdateCoreViewFieldMutationVariables[]) => {
      if (createCoreViewFieldInputs.length === 0) {
        return;
      }

      return Promise.all(
        createCoreViewFieldInputs.map((variables) =>
          updateCoreViewFieldMutation({
            variables,
            update: (_cache, { data }) => {
              const updatedViewField = data?.updateCoreViewField;
              if (!isDefined(updatedViewField)) {
                return;
              }

              triggerViewFieldOptimisticEffect({
                updatedViewFields: [updatedViewField],
              });
            },
          }),
        ),
      );
    },
    [apolloClient, triggerViewFieldOptimisticEffect],
  );

  const deleteCoreViewFieldRecords = useCallback(
    (deleteCoreViewFieldInputs: DeleteCoreViewFieldMutationVariables[]) => {
      if (deleteCoreViewFieldInputs.length === 0) {
        return;
      }

      return Promise.all(
        deleteCoreViewFieldInputs.map((variables) =>
          deleteCoreViewFieldMutation({
            variables,
            update: (_cache, { data }) => {
              const deletedViewField = data?.deleteCoreViewField;
              if (!isDefined(deletedViewField)) {
                return;
              }

              triggerViewFieldOptimisticEffect({
                deletedViewFields: [deletedViewField],
              });
            },
          }),
        ),
      );
    },
    [apolloClient, triggerViewFieldOptimisticEffect],
  );

  const destroyCoreViewFieldRecords = useCallback(
    (destroyCoreViewFieldInputs: DestroyCoreViewFieldMutationVariables[]) => {
      if (destroyCoreViewFieldInputs.length === 0) {
        return;
      }

      return Promise.all(
        destroyCoreViewFieldInputs.map((variables) =>
          destroyCoreViewFieldMutation({
            variables,
          }),
        ),
      );
    },
    [apolloClient, triggerViewFieldOptimisticEffect],
  );

  return {
    createViewFieldRecords: createCoreViewFieldRecords,
    updateViewFieldRecords: updateCoreViewFieldRecords,
    deleteViewFieldRecords: deleteCoreViewFieldRecords,
    destroyViewFieldRecords: destroyCoreViewFieldRecords,
  };
};
