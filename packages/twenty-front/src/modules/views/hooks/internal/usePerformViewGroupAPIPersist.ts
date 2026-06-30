import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { CrudOperationType } from 'twenty-shared/types';
import {
  type CreateManyViewGroupsMutationVariables,
  type UpdateManyViewGroupsMutationVariables,
  CreateManyViewGroupsDocument,
  UpdateManyViewGroupsDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewGroupAPIPersist = () => {
  const [updateManyViewGroupsMutation] = useMutation(
    UpdateManyViewGroupsDocument,
  );

  const [createManyViewGroupsMutation] = useMutation(
    CreateManyViewGroupsDocument,
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
      if (!isNonEmptyArray(updateViewGroupInputs.inputs)) {
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

  const performViewGroupAPICreate = useCallback(
    async (
      createViewGroupInputs: CreateManyViewGroupsMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<
        ReturnType<typeof createManyViewGroupsMutation>
      > | null>
    > => {
      if (!isNonEmptyArray(createViewGroupInputs.inputs)) {
        return {
          status: 'successful',
          response: null,
        };
      }

      try {
        const result = await createManyViewGroupsMutation({
          variables: createViewGroupInputs,
        });

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewGroup',
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
    [createManyViewGroupsMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  return {
    performViewGroupAPIUpdate,
    performViewGroupAPICreate,
  };
};
