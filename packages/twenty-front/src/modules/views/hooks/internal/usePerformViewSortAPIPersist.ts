import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { useMutation } from '@apollo/client/react';
import {
  type CreateCoreViewSortMutationVariables,
  type DeleteCoreViewSortMutationVariables,
  type DestroyCoreViewSortMutationVariables,
  type UpdateCoreViewSortMutationVariables,
  CreateCoreViewSortDocument,
  DeleteCoreViewSortDocument,
  DestroyCoreViewSortDocument,
  UpdateCoreViewSortDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewSortAPIPersist = () => {
  const [createCoreViewSortMutation] = useMutation(CreateCoreViewSortDocument);
  const [updateCoreViewSortMutation] = useMutation(UpdateCoreViewSortDocument);
  const [deleteCoreViewSortMutation] = useMutation(DeleteCoreViewSortDocument);
  const [destroyCoreViewSortMutation] = useMutation(
    DestroyCoreViewSortDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performViewSortAPICreate = useCallback(
    async (
      createCoreViewSortInputs: CreateCoreViewSortMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof createCoreViewSortMutation>>[]
      >
    > => {
      if (createCoreViewSortInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          createCoreViewSortInputs.map((variables) =>
            createCoreViewSortMutation({
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
            primaryMetadataName: 'viewSort',
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
    [createCoreViewSortMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const performViewSortAPIUpdate = useCallback(
    async (
      updateCoreViewSortInputs: UpdateCoreViewSortMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateCoreViewSortMutation>>[]
      >
    > => {
      if (updateCoreViewSortInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          updateCoreViewSortInputs.map((variables) =>
            updateCoreViewSortMutation({
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
            primaryMetadataName: 'viewSort',
            operationType: CrudOperationType.UPDATE,
          });
        } else {
          enqueueErrorSnackBar({ message: t`An error occurred` });
        }

        return {
          status: 'failed',
          error,
        };
      }
    },
    [updateCoreViewSortMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const performViewSortAPIDelete = useCallback(
    async (
      deleteCoreViewSortInputs: DeleteCoreViewSortMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof deleteCoreViewSortMutation>>[]
      >
    > => {
      if (deleteCoreViewSortInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          deleteCoreViewSortInputs.map((variables) =>
            deleteCoreViewSortMutation({
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
            primaryMetadataName: 'viewSort',
            operationType: CrudOperationType.DELETE,
          });
        } else {
          enqueueErrorSnackBar({ message: t`An error occurred` });
        }

        return {
          status: 'failed',
          error,
        };
      }
    },
    [deleteCoreViewSortMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const performViewSortAPIDestroy = useCallback(
    async (
      destroyCoreViewSortInputs: DestroyCoreViewSortMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof destroyCoreViewSortMutation>>[]
      >
    > => {
      if (destroyCoreViewSortInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          destroyCoreViewSortInputs.map((variables) =>
            destroyCoreViewSortMutation({
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
            primaryMetadataName: 'viewSort',
            operationType: CrudOperationType.DESTROY,
          });
        } else {
          enqueueErrorSnackBar({ message: t`An error occurred` });
        }

        return {
          status: 'failed',
          error,
        };
      }
    },
    [destroyCoreViewSortMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  return {
    performViewSortAPICreate,
    performViewSortAPIUpdate,
    performViewSortAPIDelete,
    performViewSortAPIDestroy,
  };
};
