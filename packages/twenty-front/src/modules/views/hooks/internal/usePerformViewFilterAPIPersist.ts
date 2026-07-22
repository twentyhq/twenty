import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatViewFilter } from '@/metadata-store/types/FlatViewFilter';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
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

  const { addToDraft, updateInDraft, removeFromDraft, applyChanges } =
    useUpdateMetadataStoreDraft();

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

        // Write created view filters to the metadata store immediately so a
        // subsequent save doesn't diff against stale view data and re-send
        // the same create, which fails server-side on duplicate id
        const createdFlatViewFilters = results
          .map((result) => result.data?.createViewFilter)
          .filter(isDefined)
          .map(({ __typename, ...viewFilter }) => viewFilter as FlatViewFilter);

        addToDraft({ key: 'viewFilters', items: createdFlatViewFilters });
        applyChanges();

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
    [
      createViewFilterMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      addToDraft,
      applyChanges,
    ],
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

        const updatedFlatViewFilters = results
          .map((result) => result.data?.updateViewFilter)
          .filter(isDefined)
          .map(({ __typename, ...viewFilter }) => viewFilter as FlatViewFilter);

        updateInDraft('viewFilters', updatedFlatViewFilters);
        applyChanges();

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
    [
      updateViewFilterMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      updateInDraft,
      applyChanges,
    ],
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

        removeFromDraft({
          key: 'viewFilters',
          itemIds: deleteViewFilterInputs.map(
            (variables) => variables.input.id,
          ),
        });
        applyChanges();

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
    [
      deleteViewFilterMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      removeFromDraft,
      applyChanges,
    ],
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

        removeFromDraft({
          key: 'viewFilters',
          itemIds: destroyViewFilterInputs.map(
            (variables) => variables.input.id,
          ),
        });
        applyChanges();

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
    [
      destroyViewFilterMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      removeFromDraft,
      applyChanges,
    ],
  );

  return {
    performViewFilterAPICreate,
    performViewFilterAPIUpdate,
    performViewFilterAPIDelete,
    performViewFilterAPIDestroy,
  };
};
