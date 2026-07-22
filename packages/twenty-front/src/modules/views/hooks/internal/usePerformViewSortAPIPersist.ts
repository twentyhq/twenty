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

  const { performViewEntityAPIPersistOperation } =
    usePerformViewEntityAPIPersistOperation();

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

      return performViewEntityAPIPersistOperation({
        persist: () =>
          Promise.all(
            createViewSortInputs.map((variables) =>
              createViewSortMutation({
                variables,
              }),
            ),
          ),
        syncMetadataStore: (results, { addToDraft }) =>
          addToDraft({
            key: 'viewSorts',
            items: results
              .map((result) => result.data?.createViewSort)
              .filter(isDefined)
              .map(({ __typename, ...viewSort }) => viewSort as FlatViewSort),
          }),
        primaryMetadataName: 'viewSort',
        operationType: CrudOperationType.CREATE,
      });
    },
    [createViewSortMutation, performViewEntityAPIPersistOperation],
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

      return performViewEntityAPIPersistOperation({
        persist: () =>
          Promise.all(
            updateViewSortInputs.map((variables) =>
              updateViewSortMutation({
                variables,
              }),
            ),
          ),
        syncMetadataStore: (results, { updateInDraft }) =>
          updateInDraft(
            'viewSorts',
            results
              .map((result) => result.data?.updateViewSort)
              .filter(isDefined)
              .map(({ __typename, ...viewSort }) => viewSort as FlatViewSort),
          ),
        primaryMetadataName: 'viewSort',
        operationType: CrudOperationType.UPDATE,
      });
    },
    [updateViewSortMutation, performViewEntityAPIPersistOperation],
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

      return performViewEntityAPIPersistOperation({
        persist: () =>
          Promise.all(
            deleteViewSortInputs.map((variables) =>
              deleteViewSortMutation({
                variables,
              }),
            ),
          ),
        syncMetadataStore: (_results, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewSorts',
            itemIds: deleteViewSortInputs.map(
              (variables) => variables.input.id,
            ),
          }),
        primaryMetadataName: 'viewSort',
        operationType: CrudOperationType.DELETE,
      });
    },
    [deleteViewSortMutation, performViewEntityAPIPersistOperation],
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

      return performViewEntityAPIPersistOperation({
        persist: () =>
          Promise.all(
            destroyViewSortInputs.map((variables) =>
              destroyViewSortMutation({
                variables,
              }),
            ),
          ),
        syncMetadataStore: (_results, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewSorts',
            itemIds: destroyViewSortInputs.map(
              (variables) => variables.input.id,
            ),
          }),
        primaryMetadataName: 'viewSort',
        operationType: CrudOperationType.DESTROY,
      });
    },
    [destroyViewSortMutation, performViewEntityAPIPersistOperation],
  );

  return {
    performViewSortAPICreate,
    performViewSortAPIUpdate,
    performViewSortAPIDelete,
    performViewSortAPIDestroy,
  };
};
