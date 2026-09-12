import { useCallback } from 'react';

import { type FlatViewSort } from '@/metadata-store/types/FlatViewSort';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { usePerformViewEntityApiPersistOperation } from '@/views/hooks/internal/usePerformViewEntityApiPersistOperation';
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

export const usePerformViewSortApiPersist = () => {
  const [createViewSortMutation] = useMutation(CreateViewSortDocument);
  const [updateViewSortMutation] = useMutation(UpdateViewSortDocument);
  const [deleteViewSortMutation] = useMutation(DeleteViewSortDocument);
  const [destroyViewSortMutation] = useMutation(DestroyViewSortDocument);

  const { performViewEntityApiPersistBatchOperation } =
    usePerformViewEntityApiPersistOperation('viewSort');

  const performViewSortApiCreate = useCallback(
    async (
      createViewSortInputs: CreateViewSortMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof createViewSortMutation>>[]
      >
    > =>
      performViewEntityApiPersistBatchOperation({
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
    [createViewSortMutation, performViewEntityApiPersistBatchOperation],
  );

  const performViewSortApiUpdate = useCallback(
    async (
      updateViewSortInputs: UpdateViewSortMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateViewSortMutation>>[]
      >
    > =>
      performViewEntityApiPersistBatchOperation({
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
    [updateViewSortMutation, performViewEntityApiPersistBatchOperation],
  );

  const performViewSortApiDelete = useCallback(
    async (
      deleteViewSortInputs: DeleteViewSortMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof deleteViewSortMutation>>[]
      >
    > =>
      performViewEntityApiPersistBatchOperation({
        inputs: deleteViewSortInputs,
        mutate: (variables) => deleteViewSortMutation({ variables }),
        applyResultToDraft: (fulfilledMutations, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewSorts',
            itemIds: fulfilledMutations.map(({ input }) => input.input.id),
          }),
        operationType: CrudOperationType.DELETE,
      }),
    [deleteViewSortMutation, performViewEntityApiPersistBatchOperation],
  );

  const performViewSortApiDestroy = useCallback(
    async (
      destroyViewSortInputs: DestroyViewSortMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof destroyViewSortMutation>>[]
      >
    > =>
      performViewEntityApiPersistBatchOperation({
        inputs: destroyViewSortInputs,
        mutate: (variables) => destroyViewSortMutation({ variables }),
        applyResultToDraft: (fulfilledMutations, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewSorts',
            itemIds: fulfilledMutations.map(({ input }) => input.input.id),
          }),
        operationType: CrudOperationType.DESTROY,
      }),
    [destroyViewSortMutation, performViewEntityApiPersistBatchOperation],
  );

  return {
    performViewSortApiCreate,
    performViewSortApiUpdate,
    performViewSortApiDelete,
    performViewSortApiDestroy,
  };
};
