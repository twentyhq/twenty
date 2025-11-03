import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import {
  type CreateCoreViewMutationVariables,
  type DeleteCoreViewMutationVariables,
  type UpdateCoreViewMutationVariables,
  useCreateCoreViewMutation,
  useDeleteCoreViewMutation,
  useUpdateCoreViewMutation,
} from '~/generated/graphql';

export const usePersistView = () => {
  const [createCoreViewMutation] = useCreateCoreViewMutation();
  const [updateCoreViewMutation] = useUpdateCoreViewMutation();
  const [deleteCoreViewMutation] = useDeleteCoreViewMutation();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const createView = useCallback(
    async (
      variables: CreateCoreViewMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof createCoreViewMutation>>>
    > => {
      try {
        const result = await createCoreViewMutation({
          variables,
        });

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'view',
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
    [createCoreViewMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const updateView = useCallback(
    async (
      variables: UpdateCoreViewMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof updateCoreViewMutation>>>
    > => {
      try {
        const result = await updateCoreViewMutation({
          variables,
        });

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'view',
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
    [updateCoreViewMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const deleteView = useCallback(
    async (
      variables: DeleteCoreViewMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof deleteCoreViewMutation>>>
    > => {
      try {
        const result = await deleteCoreViewMutation({
          variables,
        });

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'view',
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
    [deleteCoreViewMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  return {
    createView,
    updateView,
    deleteView,
  };
};
