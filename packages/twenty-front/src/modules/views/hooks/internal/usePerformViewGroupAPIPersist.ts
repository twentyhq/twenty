import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { useMutation } from '@apollo/client/react';
import {
  type UpdateViewGroupMutationVariables,
  UpdateViewGroupDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewGroupAPIPersist = () => {
  const [updateViewGroupMutation] = useMutation(UpdateViewGroupDocument);

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performViewGroupAPIUpdate = useCallback(
    async (
      updateViewGroupInputs: UpdateViewGroupMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateViewGroupMutation>>[]
      >
    > => {
      if (updateViewGroupInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          updateViewGroupInputs.map((variables) =>
            updateViewGroupMutation({
              variables,
            }),
          ),
        );

        return {
          status: 'successful',
          response: results,
        };
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewGroup',
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
    [updateViewGroupMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  return {
    performViewGroupAPIUpdate,
  };
};
