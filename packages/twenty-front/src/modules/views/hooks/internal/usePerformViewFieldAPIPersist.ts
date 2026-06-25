import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { useMutation } from '@apollo/client/react';
import {
  type CreateManyViewFieldsMutationVariables,
  type DeleteViewFieldMutationVariables,
  type DestroyViewFieldMutationVariables,
  type UpdateViewFieldMutationVariables,
  CreateManyViewFieldsDocument,
  DeleteViewFieldDocument,
  DestroyViewFieldDocument,
  UpdateViewFieldDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewFieldAPIPersist = () => {
  const [createManyViewFieldsMutation] = useMutation(
    CreateManyViewFieldsDocument,
  );
  const [updateViewFieldMutation] = useMutation(UpdateViewFieldDocument);
  const [deleteViewFieldMutation] = useMutation(DeleteViewFieldDocument);
  const [destroyViewFieldMutation] = useMutation(DestroyViewFieldDocument);

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performViewFieldAPICreate = useCallback(
    async (
      createViewFieldInputs: CreateManyViewFieldsMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<
        ReturnType<typeof createManyViewFieldsMutation>
      > | null>
    > => {
      if (
        !Array.isArray(createViewFieldInputs.inputs) ||
        createViewFieldInputs.inputs.length === 0
      ) {
        return {
          status: 'successful',
          response: null,
        };
      }

      try {
        const result = await createManyViewFieldsMutation({
          variables: createViewFieldInputs,
        });

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'viewField',
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
    [createManyViewFieldsMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const performViewFieldAPIUpdate = useCallback(
    async (
      createViewFieldInputs: UpdateViewFieldMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateViewFieldMutation>>[]
      >
    > => {
      if (createViewFieldInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          createViewFieldInputs.map((variables) =>
            updateViewFieldMutation({
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
            primaryMetadataName: 'viewField',
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
    [updateViewFieldMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const performViewFieldAPIDelete = useCallback(
    async (
      deleteViewFieldInputs: DeleteViewFieldMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof deleteViewFieldMutation>>[]
      >
    > => {
      if (deleteViewFieldInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          deleteViewFieldInputs.map((variables) =>
            deleteViewFieldMutation({
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
            primaryMetadataName: 'viewField',
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
    [deleteViewFieldMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const performViewFieldAPIDestroy = useCallback(
    async (
      destroyViewFieldInputs: DestroyViewFieldMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof destroyViewFieldMutation>>[]
      >
    > => {
      if (destroyViewFieldInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          destroyViewFieldInputs.map((variables) =>
            destroyViewFieldMutation({
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
            primaryMetadataName: 'viewField',
            operationType: CrudOperationType.DESTROY,
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
    [destroyViewFieldMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  return {
    performViewFieldAPICreate,
    performViewFieldAPIUpdate,
    performViewFieldAPIDelete,
    performViewFieldAPIDestroy,
  };
};
