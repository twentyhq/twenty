import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { coreViewsState } from '@/views/states/coreViewState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { CrudOperationType } from 'twenty-shared/types';
import { upsertPropertiesOfItemIntoArrayOfObjectsComparingId } from 'twenty-shared/utils';
import { useMutation } from '@apollo/client/react';
import {
  type CoreView,
  type UpdateCoreViewMutationVariables,
  UpdateCoreViewDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewAPIUpdate = () => {
  const [updateCoreViewMutation] = useMutation(UpdateCoreViewDocument);

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const setCoreViews = useSetAtomState(coreViewsState);

  const performViewAPIUpdate = useCallback(
    async (
      variables: UpdateCoreViewMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<ReturnType<typeof updateCoreViewMutation>>>
    > => {
      try {
        setCoreViews((currentCoreViews) =>
          upsertPropertiesOfItemIntoArrayOfObjectsComparingId(
            currentCoreViews,
            {
              ...variables.input,
              id: variables.id,
            } as CoreView,
          ),
        );

        const result = await updateCoreViewMutation({
          variables,
        });

        setCoreViews((currentCoreViews) =>
          upsertPropertiesOfItemIntoArrayOfObjectsComparingId(
            currentCoreViews,
            {
              ...result.data?.updateCoreView,
              id: variables.id,
            } as CoreView,
          ),
        );

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (error instanceof CombinedGraphQLErrors) {
          handleMetadataError(error, {
            primaryMetadataName: 'view',
            operationType: CrudOperationType.UPDATE,
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
      setCoreViews,
      updateCoreViewMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  return { performViewAPIUpdate };
};
