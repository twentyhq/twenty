import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTriggerViewGroupOptimisticEffect } from '@/views/optimistic-effects/hooks/useTriggerViewGroupOptimisticEffect';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  type CreateManyCoreViewGroupsMutationVariables,
  type DeleteCoreViewGroupMutationVariables,
  type DestroyCoreViewGroupMutationVariables,
  type UpdateCoreViewGroupMutationVariables,
  useCreateManyCoreViewGroupsMutation,
  useDeleteCoreViewGroupMutation,
  useDestroyCoreViewGroupMutation,
  useUpdateCoreViewGroupMutation,
} from '~/generated/graphql';

export const usePersistViewGroupRecords = () => {
  const { triggerViewGroupOptimisticEffect } =
    useTriggerViewGroupOptimisticEffect();

  const [createManyCoreViewGroupsMutation] =
    useCreateManyCoreViewGroupsMutation();
  const [updateCoreViewGroupMutation] = useUpdateCoreViewGroupMutation();
  const [deleteCoreViewGroupMutation] = useDeleteCoreViewGroupMutation();
  const [destroyCoreViewGroupMutation] = useDestroyCoreViewGroupMutation();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const createViewGroups = useCallback(
    async (
      createCoreViewGroupInputs: CreateManyCoreViewGroupsMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<
        ReturnType<typeof createManyCoreViewGroupsMutation>
      > | null>
    > => {
      if (
        !Array.isArray(createCoreViewGroupInputs.inputs) ||
        createCoreViewGroupInputs.inputs.length === 0
      ) {
        return {
          status: 'successful',
          response: null,
        };
      }

      try {
        const result = await createManyCoreViewGroupsMutation({
          variables: createCoreViewGroupInputs,
          update: (_cache, { data }) => {
            const createdViewGroups = data?.createManyCoreViewGroups;
            if (!isDefined(createdViewGroups)) {
              return;
            }

            triggerViewGroupOptimisticEffect({
              createdViewGroups,
            });
          },
        });

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewGroup',
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
      triggerViewGroupOptimisticEffect,
      createManyCoreViewGroupsMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  const updateViewGroups = useCallback(
    async (
      updateCoreViewGroupInputs: UpdateCoreViewGroupMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateCoreViewGroupMutation>>[]
      >
    > => {
      if (updateCoreViewGroupInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
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

        return {
          status: 'successful',
          response: results,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewGroup',
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
      triggerViewGroupOptimisticEffect,
      updateCoreViewGroupMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  const deleteViewGroups = useCallback(
    async (
      deleteCoreViewGroupInputs: DeleteCoreViewGroupMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof deleteCoreViewGroupMutation>>[]
      >
    > => {
      if (deleteCoreViewGroupInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
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

        return {
          status: 'successful',
          response: results,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewGroup',
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
      triggerViewGroupOptimisticEffect,
      deleteCoreViewGroupMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  const destroyViewGroups = useCallback(
    async (
      destroyCoreViewGroupInputs: DestroyCoreViewGroupMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof destroyCoreViewGroupMutation>>[]
      >
    > => {
      if (destroyCoreViewGroupInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          destroyCoreViewGroupInputs.map((variables) =>
            destroyCoreViewGroupMutation({
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
            primaryMetadataName: 'viewGroup',
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
    [destroyCoreViewGroupMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  return {
    createViewGroups,
    updateViewGroups,
    deleteViewGroups,
    destroyViewGroups,
  };
};
