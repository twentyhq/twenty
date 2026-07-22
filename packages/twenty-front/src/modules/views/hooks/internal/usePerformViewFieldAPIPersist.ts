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

  const { performViewEntityAPIPersistOperation } =
    usePerformViewEntityAPIPersistOperation();

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
        syncMetadataStore: (result, { addToDraft }) =>
          addToDraft({
            key: 'viewFields',
            items: (result.data?.createManyViewFields ?? []).map(
              ({ __typename, ...viewField }) => viewField as FlatViewField,
            ),
          }),
        primaryMetadataName: 'viewField',
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
    > => {
      if (updateViewFieldInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      return performViewEntityAPIPersistOperation({
        persist: () =>
          Promise.all(
            updateViewFieldInputs.map((variables) =>
              updateViewFieldMutation({
                variables,
              }),
            ),
          ),
        syncMetadataStore: (results, { updateInDraft }) =>
          updateInDraft(
            'viewFields',
            results
              .map((result) => result.data?.updateViewField)
              .filter(isDefined)
              .map(
                ({ __typename, ...viewField }) => viewField as FlatViewField,
              ),
          ),
        primaryMetadataName: 'viewField',
        operationType: CrudOperationType.UPDATE,
      });
    },
    [updateViewFieldMutation, performViewEntityAPIPersistOperation],
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

      return performViewEntityAPIPersistOperation({
        persist: () =>
          Promise.all(
            deleteViewFieldInputs.map((variables) =>
              deleteViewFieldMutation({
                variables,
              }),
            ),
          ),
        syncMetadataStore: (_results, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewFields',
            itemIds: deleteViewFieldInputs.map(
              (variables) => variables.input.id,
            ),
          }),
        primaryMetadataName: 'viewField',
        operationType: CrudOperationType.DELETE,
      });
    },
    [deleteViewFieldMutation, performViewEntityAPIPersistOperation],
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

      return performViewEntityAPIPersistOperation({
        persist: () =>
          Promise.all(
            destroyViewFieldInputs.map((variables) =>
              destroyViewFieldMutation({
                variables,
              }),
            ),
          ),
        syncMetadataStore: (_results, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewFields',
            itemIds: destroyViewFieldInputs.map(
              (variables) => variables.input.id,
            ),
          }),
        primaryMetadataName: 'viewField',
        operationType: CrudOperationType.DESTROY,
      });
    },
    [destroyViewFieldMutation, performViewEntityAPIPersistOperation],
  );

  return {
    performViewFieldAPICreate,
    performViewFieldAPIUpdate,
    performViewFieldAPIDelete,
    performViewFieldAPIDestroy,
  };
};
