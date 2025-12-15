import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useViewsSideEffectsOnViewGroups } from '@/views/hooks/useViewsSideEffectsOnViewGroups';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import {
  type CreateCoreViewMutationVariables,
  type DeleteCoreViewMutationVariables,
  type UpdateCoreViewMutationVariables,
  useCreateCoreViewMutation,
  useDeleteCoreViewMutation,
  useUpdateCoreViewMutation,
  ViewType,
} from '~/generated/graphql';

export const usePersistView = () => {
  const [createCoreViewMutation] = useCreateCoreViewMutation();
  const [updateCoreViewMutation] = useUpdateCoreViewMutation();
  const [deleteCoreViewMutation] = useDeleteCoreViewMutation();
  const { triggerViewGroupOptimisticEffectAtViewCreation } =
    useViewsSideEffectsOnViewGroups();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const createView = useCallback(
    async (
      variables: CreateCoreViewMutationVariables,
      objectMetadataItemId: string,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof createCoreViewMutation>>>
    > => {
      try {
        const newViewId = variables.input.id ?? v4();
        if (variables.input.type === ViewType.KANBAN) {
          triggerViewGroupOptimisticEffectAtViewCreation({
            newViewId,
            objectMetadataItemId: objectMetadataItemId,
            mainGroupByFieldMetadataId:
              variables.input.mainGroupByFieldMetadataId,
          });
        }

        const result = await createCoreViewMutation({
          variables: {
            input: {
              ...variables.input,
              id: newViewId,
            },
          },
        });

        const newView = result.data?.createCoreView;

        if (!isDefined(newView)) {
          return {
            status: 'failed',
            error: new Error('Failed to create view'),
          };
        }

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
    [
      createCoreViewMutation,
      triggerViewGroupOptimisticEffectAtViewCreation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
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
