import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTriggerViewFieldOptimisticEffect } from '@/views/optimistic-effects/hooks/useTriggerViewFieldOptimisticEffect';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  type CreateCoreViewFieldMutationVariables,
  type DeleteCoreViewFieldMutationVariables,
  type DestroyCoreViewFieldMutationVariables,
  type UpdateCoreViewFieldMutationVariables,
  useCreateCoreViewFieldMutation,
  useDeleteCoreViewFieldMutation,
  useDestroyCoreViewFieldMutation,
  useUpdateCoreViewFieldMutation,
} from '~/generated/graphql';

export const usePersistViewField = () => {
  const { triggerViewFieldOptimisticEffect } =
    useTriggerViewFieldOptimisticEffect();

  const [createCoreViewFieldMutation] = useCreateCoreViewFieldMutation();
  const [updateCoreViewFieldMutation] = useUpdateCoreViewFieldMutation();
  const [deleteCoreViewFieldMutation] = useDeleteCoreViewFieldMutation();
  const [destroyCoreViewFieldMutation] = useDestroyCoreViewFieldMutation();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const createViewFields = useCallback(
    async (
      createCoreViewFieldInputs: CreateCoreViewFieldMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof createCoreViewFieldMutation>>[]
      >
    > => {
      if (createCoreViewFieldInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
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

        return {
          status: 'successful',
          response: results,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewField',
          });
        } else {
          enqueueErrorSnackBar({ message: t`An error occurred.` });
        }

        return {
          status: 'failed',
          error,
        };
      }
    },
    [
      triggerViewFieldOptimisticEffect,
      createCoreViewFieldMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  const updateViewFields = useCallback(
    async (
      createCoreViewFieldInputs: UpdateCoreViewFieldMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateCoreViewFieldMutation>>[]
      >
    > => {
      if (createCoreViewFieldInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
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

        return {
          status: 'successful',
          response: results,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewField',
          });
        } else {
          enqueueErrorSnackBar({ message: t`An error occurred.` });
        }

        return {
          status: 'failed',
          error,
        };
      }
    },
    [
      triggerViewFieldOptimisticEffect,
      updateCoreViewFieldMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  const deleteViewFields = useCallback(
    async (
      deleteCoreViewFieldInputs: DeleteCoreViewFieldMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof deleteCoreViewFieldMutation>>[]
      >
    > => {
      if (deleteCoreViewFieldInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
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

        return {
          status: 'successful',
          response: results,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewField',
          });
        } else {
          enqueueErrorSnackBar({ message: t`An error occurred.` });
        }

        return {
          status: 'failed',
          error,
        };
      }
    },
    [
      triggerViewFieldOptimisticEffect,
      deleteCoreViewFieldMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  const destroyViewFields = useCallback(
    async (
      destroyCoreViewFieldInputs: DestroyCoreViewFieldMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof destroyCoreViewFieldMutation>>[]
      >
    > => {
      if (destroyCoreViewFieldInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          destroyCoreViewFieldInputs.map((variables) =>
            destroyCoreViewFieldMutation({
              variables,
            }),
          ),
        );

        return {
          status: 'successful',
          response: results,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewField',
          });
        } else {
          enqueueErrorSnackBar({ message: t`An error occurred.` });
        }

        return {
          status: 'failed',
          error,
        };
      }
    },
    [destroyCoreViewFieldMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  return {
    createViewFields,
    updateViewFields,
    deleteViewFields,
    destroyViewFields,
  };
};
