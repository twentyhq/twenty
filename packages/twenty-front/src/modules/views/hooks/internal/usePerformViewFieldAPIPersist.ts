import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { useMutation } from '@apollo/client/react';
import {
  type CreateManyCoreViewFieldsMutationVariables,
  type DeleteCoreViewFieldMutationVariables,
  type DestroyCoreViewFieldMutationVariables,
  type UpdateCoreViewFieldMutationVariables,
  CreateManyCoreViewFieldsDocument,
  DeleteCoreViewFieldDocument,
  DestroyCoreViewFieldDocument,
  UpdateCoreViewFieldDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewFieldAPIPersist = () => {
  const [createManyCoreViewFieldsMutation] = useMutation(
    CreateManyCoreViewFieldsDocument,
  );
  const [updateCoreViewFieldMutation] = useMutation(
    UpdateCoreViewFieldDocument,
  );
  const [deleteCoreViewFieldMutation] = useMutation(
    DeleteCoreViewFieldDocument,
  );
  const [destroyCoreViewFieldMutation] = useMutation(
    DestroyCoreViewFieldDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performViewFieldAPICreate = useCallback(
    async (
      createCoreViewFieldInputs: CreateManyCoreViewFieldsMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<
        ReturnType<typeof createManyCoreViewFieldsMutation>
      > | null>
    > => {
      if (
        !Array.isArray(createCoreViewFieldInputs.inputs) ||
        createCoreViewFieldInputs.inputs.length === 0
      ) {
        return {
          status: 'successful',
          response: null,
        };
      }

      try {
        const result = await createManyCoreViewFieldsMutation({
          variables: createCoreViewFieldInputs,
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
    [
      createManyCoreViewFieldsMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  const performViewFieldAPIUpdate = useCallback(
    async (
      createCoreViewFieldInputs: UpdateCoreViewFieldMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateCoreViewFieldMutation>>[]
      >
    > => {
      if (createCoreViewFieldInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          createCoreViewFieldInputs.map((variables) =>
            updateCoreViewFieldMutation({
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
    [updateCoreViewFieldMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const performViewFieldAPIDelete = useCallback(
    async (
      deleteCoreViewFieldInputs: DeleteCoreViewFieldMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof deleteCoreViewFieldMutation>>[]
      >
    > => {
      if (deleteCoreViewFieldInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          deleteCoreViewFieldInputs.map((variables) =>
            deleteCoreViewFieldMutation({
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
    [deleteCoreViewFieldMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const performViewFieldAPIDestroy = useCallback(
    async (
      destroyCoreViewFieldInputs: DestroyCoreViewFieldMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof destroyCoreViewFieldMutation>>[]
      >
    > => {
      if (destroyCoreViewFieldInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          destroyCoreViewFieldInputs.map((variables) =>
            destroyCoreViewFieldMutation({
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
    [destroyCoreViewFieldMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  return {
    performViewFieldAPICreate,
    performViewFieldAPIUpdate,
    performViewFieldAPIDelete,
    performViewFieldAPIDestroy,
  };
};
