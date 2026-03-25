import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { useMutation } from '@apollo/client/react';
import {
  type CreateViewFilterMutationVariables,
  type DeleteViewFilterMutationVariables,
  type DestroyViewFilterMutationVariables,
  type UpdateViewFilterMutationVariables,
  CreateViewFilterDocument,
  DeleteViewFilterDocument,
  DestroyViewFilterDocument,
  UpdateViewFilterDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewFilterAPIPersist = () => {
  const [createViewFilterMutation] = useMutation(CreateViewFilterDocument);
  const [updateViewFilterMutation] = useMutation(UpdateViewFilterDocument);
  const [deleteViewFilterMutation] = useMutation(DeleteViewFilterDocument);
  const [destroyViewFilterMutation] = useMutation(DestroyViewFilterDocument);

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performViewFilterAPICreate = useCallback(
    async (
      createViewFilterInputs: CreateViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof createViewFilterMutation>>[]
      >
    > => {
      if (createViewFilterInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          createViewFilterInputs.map((variables) =>
            createViewFilterMutation({
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
            primaryMetadataName: 'viewFilter',
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
    [createViewFilterMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const performViewFilterAPIUpdate = useCallback(
    async (
      updateViewFilterInputs: UpdateViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateViewFilterMutation>>[]
      >
    > => {
      if (updateViewFilterInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          updateViewFilterInputs.map((variables) =>
            updateViewFilterMutation({
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
            primaryMetadataName: 'viewFilter',
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
    [updateViewFilterMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const performViewFilterAPIDelete = useCallback(
    async (
      deleteViewFilterInputs: DeleteViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof deleteViewFilterMutation>>[]
      >
    > => {
      if (deleteViewFilterInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          deleteViewFilterInputs.map((variables) =>
            deleteViewFilterMutation({
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
            primaryMetadataName: 'viewFilter',
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
    [deleteViewFilterMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const performViewFilterAPIDestroy = useCallback(
    async (
      destroyViewFilterInputs: DestroyViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof destroyViewFilterMutation>>[]
      >
    > => {
      if (destroyViewFilterInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          destroyViewFilterInputs.map((variables) =>
            destroyViewFilterMutation({
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
            primaryMetadataName: 'viewFilter',
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
    [destroyViewFilterMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  return {
    performViewFilterAPICreate,
    performViewFilterAPIUpdate,
    performViewFilterAPIDelete,
    performViewFilterAPIDestroy,
  };
};
