import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useViewsSideEffectsOnViewGroups } from '@/views/hooks/useViewsSideEffectsOnViewGroups';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { useMutation } from '@apollo/client/react';
import {
  type CreateViewMutationVariables,
  type DestroyViewMutationVariables,
  ViewType,
  CreateViewDocument,
  DestroyViewDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewAPIPersist = () => {
  const [createViewMutation] = useMutation(CreateViewDocument);
  const [destroyViewMutation] = useMutation(DestroyViewDocument);
  const { triggerViewGroupOptimisticEffectAtViewCreation } =
    useViewsSideEffectsOnViewGroups();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performViewAPICreate = useCallback(
    async (
      variables: CreateViewMutationVariables,
      objectMetadataItemId: string,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof createViewMutation>>>
    > => {
      try {
        const newViewId = variables.input.id ?? v4();
        if (variables.input.type === ViewType.KANBAN) {
          triggerViewGroupOptimisticEffectAtViewCreation({
            objectMetadataItemId: objectMetadataItemId,
            mainGroupByFieldMetadataId:
              variables.input.mainGroupByFieldMetadataId,
          });
        }

        const result = await createViewMutation({
          variables: {
            input: {
              ...variables.input,
              id: newViewId,
            },
          },
        });

        const newView = result.data?.createView;

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
        if (CombinedGraphQLErrors.is(error)) {
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
      createViewMutation,
      triggerViewGroupOptimisticEffectAtViewCreation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  const performViewAPIDestroy = useCallback(
    async (
      variables: DestroyViewMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof destroyViewMutation>>>
    > => {
      try {
        const result = await destroyViewMutation({
          variables,
        });

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
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
    [destroyViewMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  return {
    performViewAPICreate,
    performViewAPIDestroy,
  };
};
