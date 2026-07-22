import { useCallback } from 'react';

import { type FlatViewFilter } from '@/metadata-store/types/FlatViewFilter';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { usePerformViewEntityAPIPersistOperation } from '@/views/hooks/internal/usePerformViewEntityAPIPersistOperation';
import { useMutation } from '@apollo/client/react';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
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

  const { performViewEntityAPIPersistOperation } =
    usePerformViewEntityAPIPersistOperation();

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

      return performViewEntityAPIPersistOperation({
        persist: () =>
          Promise.all(
            createViewFilterInputs.map((variables) =>
              createViewFilterMutation({
                variables,
              }),
            ),
          ),
        syncMetadataStore: (results, { addToDraft }) =>
          addToDraft({
            key: 'viewFilters',
            items: results
              .map((result) => result.data?.createViewFilter)
              .filter(isDefined)
              .map(
                ({ __typename, ...viewFilter }) => viewFilter as FlatViewFilter,
              ),
          }),
        primaryMetadataName: 'viewFilter',
        operationType: CrudOperationType.CREATE,
      });
    },
    [createViewFilterMutation, performViewEntityAPIPersistOperation],
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

      return performViewEntityAPIPersistOperation({
        persist: () =>
          Promise.all(
            updateViewFilterInputs.map((variables) =>
              updateViewFilterMutation({
                variables,
              }),
            ),
          ),
        syncMetadataStore: (results, { updateInDraft }) =>
          updateInDraft(
            'viewFilters',
            results
              .map((result) => result.data?.updateViewFilter)
              .filter(isDefined)
              .map(
                ({ __typename, ...viewFilter }) => viewFilter as FlatViewFilter,
              ),
          ),
        primaryMetadataName: 'viewFilter',
        operationType: CrudOperationType.UPDATE,
      });
    },
    [updateViewFilterMutation, performViewEntityAPIPersistOperation],
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

      return performViewEntityAPIPersistOperation({
        persist: () =>
          Promise.all(
            deleteViewFilterInputs.map((variables) =>
              deleteViewFilterMutation({
                variables,
              }),
            ),
          ),
        syncMetadataStore: (_results, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewFilters',
            itemIds: deleteViewFilterInputs.map(
              (variables) => variables.input.id,
            ),
          }),
        primaryMetadataName: 'viewFilter',
        operationType: CrudOperationType.DELETE,
      });
    },
    [deleteViewFilterMutation, performViewEntityAPIPersistOperation],
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

      return performViewEntityAPIPersistOperation({
        persist: () =>
          Promise.all(
            destroyViewFilterInputs.map((variables) =>
              destroyViewFilterMutation({
                variables,
              }),
            ),
          ),
        syncMetadataStore: (_results, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewFilters',
            itemIds: destroyViewFilterInputs.map(
              (variables) => variables.input.id,
            ),
          }),
        primaryMetadataName: 'viewFilter',
        operationType: CrudOperationType.DESTROY,
      });
    },
    [destroyViewFilterMutation, performViewEntityAPIPersistOperation],
  );

  return {
    performViewFilterAPICreate,
    performViewFilterAPIUpdate,
    performViewFilterAPIDelete,
    performViewFilterAPIDestroy,
  };
};
