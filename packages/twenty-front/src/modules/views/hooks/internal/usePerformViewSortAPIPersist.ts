import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatViewSort } from '@/metadata-store/types/FlatViewSort';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useMutation } from '@apollo/client/react';
import {
  type CreateViewSortMutationVariables,
  type DeleteViewSortMutationVariables,
  type DestroyViewSortMutationVariables,
  type UpdateViewSortMutationVariables,
  CreateViewSortDocument,
  DeleteViewSortDocument,
  DestroyViewSortDocument,
  UpdateViewSortDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewSortAPIPersist = () => {
  const [createViewSortMutation] = useMutation(CreateViewSortDocument);
  const [updateViewSortMutation] = useMutation(UpdateViewSortDocument);
  const [deleteViewSortMutation] = useMutation(DeleteViewSortDocument);
  const [destroyViewSortMutation] = useMutation(DestroyViewSortDocument);

  const { addToDraft, updateInDraft, removeFromDraft, applyChanges } =
    useUpdateMetadataStoreDraft();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performViewSortAPICreate = useCallback(
    async (
      createViewSortInputs: CreateViewSortMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof createViewSortMutation>>[]
      >
    > => {
      if (createViewSortInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          createViewSortInputs.map((variables) =>
            createViewSortMutation({
              variables,
            }),
          ),
        );

        // Write created view sorts to the metadata store immediately so a
        // subsequent save doesn't diff against stale view data and re-send
        // the same create, which fails server-side on duplicate id
        const createdFlatViewSorts = results
          .map((result) => result.data?.createViewSort)
          .filter(isDefined)
          .map(({ __typename, ...viewSort }) => viewSort as FlatViewSort);

        addToDraft({ key: 'viewSorts', items: createdFlatViewSorts });
        applyChanges();

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
    [
      createViewSortMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      addToDraft,
      applyChanges,
    ],
  );

  const performViewSortAPIUpdate = useCallback(
    async (
      updateViewSortInputs: UpdateViewSortMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateViewSortMutation>>[]
      >
    > => {
      if (updateViewSortInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          updateViewSortInputs.map((variables) =>
            updateViewSortMutation({
              variables,
            }),
          ),
        );

        const updatedFlatViewSorts = results
          .map((result) => result.data?.updateViewSort)
          .filter(isDefined)
          .map(({ __typename, ...viewSort }) => viewSort as FlatViewSort);

        updateInDraft('viewSorts', updatedFlatViewSorts);
        applyChanges();

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
    [
      updateViewSortMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      updateInDraft,
      applyChanges,
    ],
  );

  const performViewSortAPIDelete = useCallback(
    async (
      deleteViewSortInputs: DeleteViewSortMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof deleteViewSortMutation>>[]
      >
    > => {
      if (deleteViewSortInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          deleteViewSortInputs.map((variables) =>
            deleteViewSortMutation({
              variables,
            }),
          ),
        );

        removeFromDraft({
          key: 'viewSorts',
          itemIds: deleteViewSortInputs.map((variables) => variables.input.id),
        });
        applyChanges();

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
    [
      deleteViewSortMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      removeFromDraft,
      applyChanges,
    ],
  );

  const performViewSortAPIDestroy = useCallback(
    async (
      destroyViewSortInputs: DestroyViewSortMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof destroyViewSortMutation>>[]
      >
    > => {
      if (destroyViewSortInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      try {
        const results = await Promise.all(
          destroyViewSortInputs.map((variables) =>
            destroyViewSortMutation({
              variables,
            }),
          ),
        );

        removeFromDraft({
          key: 'viewSorts',
          itemIds: destroyViewSortInputs.map((variables) => variables.input.id),
        });
        applyChanges();

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
    [
      destroyViewSortMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      removeFromDraft,
      applyChanges,
    ],
  );

  return {
    performViewSortAPICreate,
    performViewSortAPIUpdate,
    performViewSortAPIDelete,
    performViewSortAPIDestroy,
  };
};
