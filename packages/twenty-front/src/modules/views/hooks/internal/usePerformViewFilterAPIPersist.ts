import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { useMutation } from '@apollo/client/react';
import {
  type CreateCoreViewFilterMutationVariables,
  type DeleteCoreViewFilterMutationVariables,
  type DestroyCoreViewFilterMutationVariables,
  type UpdateCoreViewFilterMutationVariables,
  CreateCoreViewFilterDocument,
  DeleteCoreViewFilterDocument,
  DestroyCoreViewFilterDocument,
  UpdateCoreViewFilterDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewFilterAPIPersist = () => {
  const [createCoreViewFilterMutation] = useMutation(
    CreateCoreViewFilterDocument,
  );
  const [updateCoreViewFilterMutation] = useMutation(
    UpdateCoreViewFilterDocument,
  );
  const [deleteCoreViewFilterMutation] = useMutation(
    DeleteCoreViewFilterDocument,
  );
  const [destroyCoreViewFilterMutation] = useMutation(
    DestroyCoreViewFilterDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performViewFilterAPICreate = useCallback(
    async (
      createCoreViewFilterInputs: CreateCoreViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof createCoreViewFilterMutation>>[]
      >
    > => {
      if (createCoreViewFilterInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          createCoreViewFilterInputs.map((variables) =>
            createCoreViewFilterMutation({
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
    [createCoreViewFilterMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const performViewFilterAPIUpdate = useCallback(
    async (
      updateCoreViewFilterInputs: UpdateCoreViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateCoreViewFilterMutation>>[]
      >
    > => {
      if (updateCoreViewFilterInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          updateCoreViewFilterInputs.map((variables) =>
            updateCoreViewFilterMutation({
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
    [updateCoreViewFilterMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const performViewFilterAPIDelete = useCallback(
    async (
      deleteCoreViewFilterInputs: DeleteCoreViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof deleteCoreViewFilterMutation>>[]
      >
    > => {
      if (deleteCoreViewFilterInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          deleteCoreViewFilterInputs.map((variables) =>
            deleteCoreViewFilterMutation({
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
    [deleteCoreViewFilterMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const performViewFilterAPIDestroy = useCallback(
    async (
      destroyCoreViewFilterInputs: DestroyCoreViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof destroyCoreViewFilterMutation>>[]
      >
    > => {
      if (destroyCoreViewFilterInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          destroyCoreViewFilterInputs.map((variables) =>
            destroyCoreViewFilterMutation({
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
    [destroyCoreViewFilterMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  return {
    performViewFilterAPICreate,
    performViewFilterAPIUpdate,
    performViewFilterAPIDelete,
    performViewFilterAPIDestroy,
  };
};
