import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { useMutation } from '@apollo/client/react';
import {
  type UpdateCoreViewMutationVariables,
  UpdateCoreViewDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewAPIUpdate = () => {
  const [updateCoreViewMutation] = useMutation(UpdateCoreViewDocument);

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performViewAPIUpdate = useCallback(
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
        if (CombinedGraphQLErrors.is(error)) {
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
    [updateCoreViewMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  return { performViewAPIUpdate };
};
