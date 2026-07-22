import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
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

  const { addToDraft, updateInDraft, removeFromDraft, applyChanges } =
    useUpdateMetadataStoreDraft();

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

        // Write created view fields to the metadata store immediately so a
        // subsequent save doesn't diff against stale view data and re-send
        // the same create, which fails server-side on duplicate id
        const createdFlatViewFields = (
          result.data?.createManyViewFields ?? []
        ).map(({ __typename, ...viewField }) => viewField as FlatViewField);

        addToDraft({ key: 'viewFields', items: createdFlatViewFields });
        applyChanges();

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
      createManyViewFieldsMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      addToDraft,
      applyChanges,
    ],
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

        const updatedFlatViewFields = results
          .map((result) => result.data?.updateViewField)
          .filter(isDefined)
          .map(({ __typename, ...viewField }) => viewField as FlatViewField);

        updateInDraft('viewFields', updatedFlatViewFields);
        applyChanges();

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
    [
      updateViewFieldMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      updateInDraft,
      applyChanges,
    ],
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

        removeFromDraft({
          key: 'viewFields',
          itemIds: deleteViewFieldInputs.map((variables) => variables.input.id),
        });
        applyChanges();

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
    [
      deleteViewFieldMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      removeFromDraft,
      applyChanges,
    ],
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

        removeFromDraft({
          key: 'viewFields',
          itemIds: destroyViewFieldInputs.map(
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
    [
      destroyViewFieldMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
      removeFromDraft,
      applyChanges,
    ],
  );

  return {
    performViewFieldAPICreate,
    performViewFieldAPIUpdate,
    performViewFieldAPIDelete,
    performViewFieldAPIDestroy,
  };
};
