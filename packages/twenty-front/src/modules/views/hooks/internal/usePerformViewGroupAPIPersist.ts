import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { useMutation } from '@apollo/client/react';
import {
  type UpdateManyViewGroupsMutationVariables,
  UpdateManyViewGroupsDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewGroupAPIPersist = () => {
  const [updateManyViewGroupsMutation] = useMutation(
    UpdateManyViewGroupsDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performViewGroupAPIUpdate = useCallback(
    async (
      updateViewGroupInputs: UpdateManyViewGroupsMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<
        ReturnType<typeof updateManyViewGroupsMutation>
      > | null>
    > => {
      if (
        !Array.isArray(updateViewGroupInputs.inputs) ||
        updateViewGroupInputs.inputs.length === 0
      ) {
        return {
          status: 'successful',
          response: null,
        };
      }

      try {
        const result = await updateManyViewGroupsMutation({
          variables: updateViewGroupInputs,
        });

        return {
          status: 'successful',
          response: result,
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
    [updateManyViewGroupsMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  return {
    performViewGroupAPIUpdate,
  };
};
