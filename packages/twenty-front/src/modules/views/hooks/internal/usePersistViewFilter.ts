import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTriggerViewFilterOptimisticEffect } from '@/views/optimistic-effects/hooks/useTriggerViewFilterOptimisticEffect';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
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

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const createViewFilters = useCallback(
    async (
      createCoreViewFilterInputs: CreateCoreViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof createCoreViewFilterMutation>>[]
      >
    > => {
      if (createCoreViewFilterInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          createCoreViewFilterInputs.map((variables) =>
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

        return {
          status: 'successful',
          response: results,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewFilter',
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
      triggerViewFilterOptimisticEffect,
      createCoreViewFilterMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  const updateViewFilters = useCallback(
    async (
      updateCoreViewFilterInputs: UpdateCoreViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateCoreViewFilterMutation>>[]
      >
    > => {
      if (updateCoreViewFilterInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
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

        return {
          status: 'successful',
          response: results,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewFilter',
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
      triggerViewFilterOptimisticEffect,
      updateCoreViewFilterMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  const deleteViewFilters = useCallback(
    async (
      deleteCoreViewFilterInputs: DeleteCoreViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof deleteCoreViewFilterMutation>>[]
      >
    > => {
      if (deleteCoreViewFilterInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
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

        return {
          status: 'successful',
          response: results,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewFilter',
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
      triggerViewFilterOptimisticEffect,
      deleteCoreViewFilterMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  const destroyViewFilters = useCallback(
    async (
      destroyCoreViewFilterInputs: DestroyCoreViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof destroyCoreViewFilterMutation>>[]
      >
    > => {
      if (destroyCoreViewFilterInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          destroyCoreViewFilterInputs.map((variables) =>
            destroyCoreViewFilterMutation({
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
            primaryMetadataName: 'viewFilter',
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
    [destroyCoreViewFilterMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  return {
    createViewFilters,
    updateViewFilters,
    deleteViewFilters,
    destroyViewFilters,
  };
};
