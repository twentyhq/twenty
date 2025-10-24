import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
    type CreateViewInput,
    type UpdateViewInput,
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
      input: CreateViewInput,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof createCoreViewMutation>>>
    > => {
      try {
        const result = await createCoreViewMutation({
          variables: {
            input,
          },
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
      id: string,
      input: UpdateViewInput,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof updateCoreViewMutation>>>
    > => {
      if (!isDefined(id)) {
        return {
          status: 'failed',
          error: new Error('View ID is required'),
        };
      }

      try {
        const result = await updateCoreViewMutation({
          variables: {
            id,
            input,
          },
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
      id: string,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof deleteCoreViewMutation>>>
    > => {
      if (!isDefined(id)) {
        return {
          status: 'failed',
          error: new Error('View ID is required'),
        };
      }

      try {
        const result = await deleteCoreViewMutation({
          variables: {
            id,
          },
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

