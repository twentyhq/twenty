import { useCallback } from 'react';

import { type FlatViewFilter } from '@/metadata-store/types/FlatViewFilter';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { usePerformViewEntityAPIPersistOperation } from '@/views/hooks/internal/usePerformViewEntityAPIPersistOperation';
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

export const usePerformViewFilterAPIPersist = () => {
  const [createViewFilterMutation] = useMutation(CreateViewFilterDocument);
  const [updateViewFilterMutation] = useMutation(UpdateViewFilterDocument);
  const [deleteViewFilterMutation] = useMutation(DeleteViewFilterDocument);
  const [destroyViewFilterMutation] = useMutation(DestroyViewFilterDocument);

  const { performViewEntityAPIPersistBatchOperation } =
    usePerformViewEntityAPIPersistOperation('viewFilter');

  const performViewFilterAPICreate = useCallback(
    async (
      createViewFilterInputs: CreateViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof createViewFilterMutation>>[]
      >
    > =>
      performViewEntityAPIPersistBatchOperation({
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
    [createViewFilterMutation, performViewEntityAPIPersistBatchOperation],
  );

  const performViewFilterAPIUpdate = useCallback(
    async (
      updateViewFilterInputs: UpdateViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateViewFilterMutation>>[]
      >
    > =>
      performViewEntityAPIPersistBatchOperation({
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
    [updateViewFilterMutation, performViewEntityAPIPersistBatchOperation],
  );

  const performViewFilterAPIDelete = useCallback(
    async (
      deleteViewFilterInputs: DeleteViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof deleteViewFilterMutation>>[]
      >
    > =>
      performViewEntityAPIPersistBatchOperation({
        inputs: deleteViewFilterInputs,
        mutate: (variables) => deleteViewFilterMutation({ variables }),
        applyResultToDraft: (fulfilledMutations, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewFilters',
            itemIds: fulfilledMutations.map(({ input }) => input.input.id),
          }),
        operationType: CrudOperationType.DELETE,
      }),
    [deleteViewFilterMutation, performViewEntityAPIPersistBatchOperation],
  );

  const performViewFilterAPIDestroy = useCallback(
    async (
      destroyViewFilterInputs: DestroyViewFilterMutationVariables[],
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof destroyViewFilterMutation>>[]
      >
    > =>
      performViewEntityAPIPersistBatchOperation({
        inputs: destroyViewFilterInputs,
        mutate: (variables) => destroyViewFilterMutation({ variables }),
        applyResultToDraft: (fulfilledMutations, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewFilters',
            itemIds: fulfilledMutations.map(({ input }) => input.input.id),
          }),
        operationType: CrudOperationType.DESTROY,
      }),
    [destroyViewFilterMutation, performViewEntityAPIPersistBatchOperation],
  );

  return {
    performViewFilterAPICreate,
    performViewFilterAPIUpdate,
    performViewFilterAPIDelete,
    performViewFilterAPIDestroy,
  };
};
