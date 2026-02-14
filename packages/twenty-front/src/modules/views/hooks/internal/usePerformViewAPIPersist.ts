import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useViewsSideEffectsOnViewGroups } from '@/views/hooks/useViewsSideEffectsOnViewGroups';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import {
  type CreateCoreViewMutationVariables,
  type DestroyCoreViewMutationVariables,
  useCreateCoreViewMutation,
  useDestroyCoreViewMutation,
  ViewType,
} from '~/generated-metadata/graphql';

export const usePerformViewAPIPersist = () => {
  const [createCoreViewMutation] = useCreateCoreViewMutation();
  const [destroyCoreViewMutation] = useDestroyCoreViewMutation();
  const { triggerViewGroupOptimisticEffectAtViewCreation } =
    useViewsSideEffectsOnViewGroups();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performViewAPICreate = useCallback(
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
            operationType: CrudOperationType.CREATE,
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

  const performViewAPIDestroy = useCallback(
    async (
      variables: DestroyCoreViewMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof destroyCoreViewMutation>>>
    > => {
      try {
        const result = await destroyCoreViewMutation({
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
            operationType: CrudOperationType.DELETE,
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
    [destroyCoreViewMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  return {
    performViewAPICreate,
    performViewAPIDestroy,
  };
};
