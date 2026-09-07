import { useCallback } from 'react';

import { type FlatViewFilter } from '@/metadata-store/types/FlatViewFilter';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { usePerformViewEntityApiPersistOperation } from '@/views/hooks/internal/usePerformViewEntityApiPersistOperation';
import { useMutation } from '@apollo/client/react';
import { CrudOperationType } from 'twenty-shared/types';
import { convertViewFilterValueToString, isDefined } from 'twenty-shared/utils';
import {
  type CreateViewFilterMutationVariables,
  type DeleteViewFilterMutationVariables,
  type DestroyViewFilterMutationVariables,
  type UpdateViewFilterMutationVariables,
  type ViewFilterFragmentFragment,
  CreateViewFilterDocument,
  DeleteViewFilterDocument,
  DestroyViewFilterDocument,
  UpdateViewFilterDocument,
} from '~/generated-metadata/graphql';

// Normalize value like the fetch path (splitViewWithRelated) so store
// comparisons against string-converted values stay consistent
const toFlatViewFilter = ({
  __typename,
  ...viewFilter
}: ViewFilterFragmentFragment): FlatViewFilter =>
  ({
    ...viewFilter,
    value: convertViewFilterValueToString(viewFilter.value),
  }) as FlatViewFilter;

export const usePerformViewFilterApiPersist = () => {
  const [createViewFilterMutation] = useMutation(CreateViewFilterDocument);
  const [updateViewFilterMutation] = useMutation(UpdateViewFilterDocument);
  const [deleteViewFilterMutation] = useMutation(DeleteViewFilterDocument);
  const [destroyViewFilterMutation] = useMutation(DestroyViewFilterDocument);

  const { performViewEntityApiPersistBatchOperation } =
    usePerformViewEntityApiPersistOperation('viewFilter');

  const performViewFilterApiCreate = useCallback(
    async (
      createViewFilterInputs: CreateViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof createViewFilterMutation>>[]
      >
    > =>
      performViewEntityApiPersistBatchOperation({
        inputs: createViewFilterInputs,
        mutate: (variables) => createViewFilterMutation({ variables }),
        applyResultToDraft: (fulfilledMutations, { addToDraft }) =>
          addToDraft({
            key: 'viewFilters',
            items: fulfilledMutations
              .map(({ result }) => result.data?.createViewFilter)
              .filter(isDefined)
              .map(toFlatViewFilter),
          }),
        operationType: CrudOperationType.CREATE,
      }),
    [createViewFilterMutation, performViewEntityApiPersistBatchOperation],
  );

  const performViewFilterApiUpdate = useCallback(
    async (
      updateViewFilterInputs: UpdateViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateViewFilterMutation>>[]
      >
    > =>
      performViewEntityApiPersistBatchOperation({
        inputs: updateViewFilterInputs,
        mutate: (variables) => updateViewFilterMutation({ variables }),
        applyResultToDraft: (fulfilledMutations, { updateInDraft }) =>
          updateInDraft(
            'viewFilters',
            fulfilledMutations
              .map(({ result }) => result.data?.updateViewFilter)
              .filter(isDefined)
              .map(toFlatViewFilter),
          ),
        operationType: CrudOperationType.UPDATE,
      }),
    [updateViewFilterMutation, performViewEntityApiPersistBatchOperation],
  );

  const performViewFilterApiDelete = useCallback(
    async (
      deleteViewFilterInputs: DeleteViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof deleteViewFilterMutation>>[]
      >
    > =>
      performViewEntityApiPersistBatchOperation({
        inputs: deleteViewFilterInputs,
        mutate: (variables) => deleteViewFilterMutation({ variables }),
        applyResultToDraft: (fulfilledMutations, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewFilters',
            itemIds: fulfilledMutations.map(({ input }) => input.input.id),
          }),
        operationType: CrudOperationType.DELETE,
      }),
    [deleteViewFilterMutation, performViewEntityApiPersistBatchOperation],
  );

  const performViewFilterApiDestroy = useCallback(
    async (
      destroyViewFilterInputs: DestroyViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof destroyViewFilterMutation>>[]
      >
    > =>
      performViewEntityApiPersistBatchOperation({
        inputs: destroyViewFilterInputs,
        mutate: (variables) => destroyViewFilterMutation({ variables }),
        applyResultToDraft: (fulfilledMutations, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewFilters',
            itemIds: fulfilledMutations.map(({ input }) => input.input.id),
          }),
        operationType: CrudOperationType.DESTROY,
      }),
    [destroyViewFilterMutation, performViewEntityApiPersistBatchOperation],
  );

  return {
    performViewFilterApiCreate,
    performViewFilterApiUpdate,
    performViewFilterApiDelete,
    performViewFilterApiDestroy,
  };
};
