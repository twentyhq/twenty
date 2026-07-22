import { useCallback } from 'react';

import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { usePerformViewEntityAPIPersistOperation } from '@/views/hooks/internal/usePerformViewEntityAPIPersistOperation';
import { useMutation } from '@apollo/client/react';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
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

  const {
    performViewEntityAPIPersistOperation,
    performViewEntityAPIPersistBatchOperation,
  } = usePerformViewEntityAPIPersistOperation('viewField');

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

      return performViewEntityAPIPersistOperation({
        persist: () =>
          createManyViewFieldsMutation({
            variables: createViewFieldInputs,
          }),
        applyResultToDraft: (result, { addToDraft }) =>
          addToDraft({
            key: 'viewFields',
            items: (result.data?.createManyViewFields ?? []).map(
              ({ __typename, ...viewField }) => viewField as FlatViewField,
            ),
          }),
        operationType: CrudOperationType.CREATE,
      });
    },
    [createManyViewFieldsMutation, performViewEntityAPIPersistOperation],
  );

  const performViewFieldAPIUpdate = useCallback(
    async (
      updateViewFieldInputs: UpdateViewFieldMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateViewFieldMutation>>[]
      >
    > =>
      performViewEntityAPIPersistBatchOperation({
        inputs: updateViewFieldInputs,
        mutate: (variables) => updateViewFieldMutation({ variables }),
        applyResultToDraft: (fulfilledMutations, { updateInDraft }) =>
          updateInDraft(
            'viewFields',
            fulfilledMutations
              .map(({ result }) => result.data?.updateViewField)
              .filter(isDefined)
              .map(
                ({ __typename, ...viewField }) => viewField as FlatViewField,
              ),
          ),
        operationType: CrudOperationType.UPDATE,
      }),
    [updateViewFieldMutation, performViewEntityAPIPersistBatchOperation],
  );

  const performViewFieldAPIDelete = useCallback(
    async (
      deleteViewFieldInputs: DeleteViewFieldMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof deleteViewFieldMutation>>[]
      >
    > =>
      performViewEntityAPIPersistBatchOperation({
        inputs: deleteViewFieldInputs,
        mutate: (variables) => deleteViewFieldMutation({ variables }),
        applyResultToDraft: (fulfilledMutations, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewFields',
            itemIds: fulfilledMutations.map(({ input }) => input.input.id),
          }),
        operationType: CrudOperationType.DELETE,
      }),
    [deleteViewFieldMutation, performViewEntityAPIPersistBatchOperation],
  );

  const performViewFieldAPIDestroy = useCallback(
    async (
      destroyViewFieldInputs: DestroyViewFieldMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof destroyViewFieldMutation>>[]
      >
    > =>
      performViewEntityAPIPersistBatchOperation({
        inputs: destroyViewFieldInputs,
        mutate: (variables) => destroyViewFieldMutation({ variables }),
        applyResultToDraft: (fulfilledMutations, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewFields',
            itemIds: fulfilledMutations.map(({ input }) => input.input.id),
          }),
        operationType: CrudOperationType.DESTROY,
      }),
    [destroyViewFieldMutation, performViewEntityAPIPersistBatchOperation],
  );

  return {
    performViewFieldAPICreate,
    performViewFieldAPIUpdate,
    performViewFieldAPIDelete,
    performViewFieldAPIDestroy,
  };
};
