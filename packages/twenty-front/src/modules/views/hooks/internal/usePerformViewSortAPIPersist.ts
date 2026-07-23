import { useCallback } from 'react';

import { type FlatViewSort } from '@/metadata-store/types/FlatViewSort';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { usePerformViewEntityAPIPersistOperation } from '@/views/hooks/internal/usePerformViewEntityAPIPersistOperation';
import { useMutation } from '@apollo/client/react';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
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

  const { performViewEntityAPIPersistBatchOperation } =
    usePerformViewEntityAPIPersistOperation('viewSort');

  const performViewSortAPICreate = useCallback(
    async (
      createViewSortInputs: CreateViewSortMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof createViewSortMutation>>[]
      >
    > =>
      performViewEntityAPIPersistBatchOperation({
        inputs: createViewSortInputs,
        mutate: (variables) => createViewSortMutation({ variables }),
        applyResultToDraft: (fulfilledMutations, { addToDraft }) =>
          addToDraft({
            key: 'viewSorts',
            items: fulfilledMutations
              .map(({ result }) => result.data?.createViewSort)
              .filter(isDefined)
              .map(({ __typename, ...viewSort }) => viewSort as FlatViewSort),
          }),
        operationType: CrudOperationType.CREATE,
      }),
    [createViewSortMutation, performViewEntityAPIPersistBatchOperation],
  );

  const performViewSortAPIUpdate = useCallback(
    async (
      updateViewSortInputs: UpdateViewSortMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateViewSortMutation>>[]
      >
    > =>
      performViewEntityAPIPersistBatchOperation({
        inputs: updateViewSortInputs,
        mutate: (variables) => updateViewSortMutation({ variables }),
        applyResultToDraft: (fulfilledMutations, { updateInDraft }) =>
          updateInDraft(
            'viewSorts',
            fulfilledMutations
              .map(({ result }) => result.data?.updateViewSort)
              .filter(isDefined)
              .map(({ __typename, ...viewSort }) => viewSort as FlatViewSort),
          ),
        operationType: CrudOperationType.UPDATE,
      }),
    [updateViewSortMutation, performViewEntityAPIPersistBatchOperation],
  );

  const performViewSortAPIDelete = useCallback(
    async (
      deleteViewSortInputs: DeleteViewSortMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof deleteViewSortMutation>>[]
      >
    > =>
      performViewEntityAPIPersistBatchOperation({
        inputs: deleteViewSortInputs,
        mutate: (variables) => deleteViewSortMutation({ variables }),
        applyResultToDraft: (fulfilledMutations, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewSorts',
            itemIds: fulfilledMutations.map(({ input }) => input.input.id),
          }),
        operationType: CrudOperationType.DELETE,
      }),
    [deleteViewSortMutation, performViewEntityAPIPersistBatchOperation],
  );

  const performViewSortAPIDestroy = useCallback(
    async (
      destroyViewSortInputs: DestroyViewSortMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof destroyViewSortMutation>>[]
      >
    > =>
      performViewEntityAPIPersistBatchOperation({
        inputs: destroyViewSortInputs,
        mutate: (variables) => destroyViewSortMutation({ variables }),
        applyResultToDraft: (fulfilledMutations, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewSorts',
            itemIds: fulfilledMutations.map(({ input }) => input.input.id),
          }),
        operationType: CrudOperationType.DESTROY,
      }),
    [destroyViewSortMutation, performViewEntityAPIPersistBatchOperation],
  );

  return {
    performViewSortAPICreate,
    performViewSortAPIUpdate,
    performViewSortAPIDelete,
    performViewSortAPIDestroy,
  };
};
