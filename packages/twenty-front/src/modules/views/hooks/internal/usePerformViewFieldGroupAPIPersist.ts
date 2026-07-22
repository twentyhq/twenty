import { useCallback } from 'react';

import { type FlatViewFieldGroup } from '@/metadata-store/types/FlatViewFieldGroup';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { CREATE_MANY_VIEW_FIELD_GROUPS } from '@/views/graphql/mutations/createManyViewFieldGroups';
import { DELETE_VIEW_FIELD_GROUP } from '@/views/graphql/mutations/deleteViewFieldGroup';
import { UPDATE_VIEW_FIELD_GROUP } from '@/views/graphql/mutations/updateViewFieldGroup';
import { usePerformViewEntityAPIPersistOperation } from '@/views/hooks/internal/usePerformViewEntityAPIPersistOperation';
import { useMutation } from '@apollo/client/react';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type ViewFieldGroup,
  type MutationCreateManyViewFieldGroupsArgs,
  type MutationDeleteViewFieldGroupArgs,
  type MutationUpdateViewFieldGroupArgs,
} from '~/generated-metadata/graphql';

type CreateManyViewFieldGroupsMutationResult = {
  createManyViewFieldGroups: ViewFieldGroup[];
};

type UpdateViewFieldGroupMutationResult = {
  updateViewFieldGroup: ViewFieldGroup;
};

type DeleteViewFieldGroupMutationResult = {
  deleteViewFieldGroup: ViewFieldGroup;
};

const toFlatViewFieldGroup = (
  viewFieldGroup: ViewFieldGroup,
): FlatViewFieldGroup => {
  const {
    __typename,
    viewFields: _viewFields,
    ...flatViewFieldGroup
  } = viewFieldGroup;

  return flatViewFieldGroup as FlatViewFieldGroup;
};

export const usePerformViewFieldGroupAPIPersist = () => {
  const [createManyViewFieldGroupsMutation] = useMutation<
    CreateManyViewFieldGroupsMutationResult,
    MutationCreateManyViewFieldGroupsArgs
  >(CREATE_MANY_VIEW_FIELD_GROUPS);
  const [updateViewFieldGroupMutation] = useMutation<
    UpdateViewFieldGroupMutationResult,
    MutationUpdateViewFieldGroupArgs
  >(UPDATE_VIEW_FIELD_GROUP);
  const [deleteViewFieldGroupMutation] = useMutation<
    DeleteViewFieldGroupMutationResult,
    MutationDeleteViewFieldGroupArgs
  >(DELETE_VIEW_FIELD_GROUP);

  const { performViewEntityAPIPersistOperation } =
    usePerformViewEntityAPIPersistOperation();

  const performViewFieldGroupAPICreate = useCallback(
    async (
      createViewFieldGroupInputs: MutationCreateManyViewFieldGroupsArgs,
    ): Promise<
      MetadataRequestResult<CreateManyViewFieldGroupsMutationResult | null>
    > => {
      if (
        !Array.isArray(createViewFieldGroupInputs.inputs) ||
        createViewFieldGroupInputs.inputs.length === 0
      ) {
        return {
          status: 'successful',
          response: null,
        };
      }

      return performViewEntityAPIPersistOperation({
        persist: async () => {
          const result = await createManyViewFieldGroupsMutation({
            variables: createViewFieldGroupInputs,
          });

          return result.data ?? null;
        },
        syncMetadataStore: (createdData, { addToDraft }) =>
          addToDraft({
            key: 'viewFieldGroups',
            items: (createdData?.createManyViewFieldGroups ?? []).map(
              toFlatViewFieldGroup,
            ),
          }),
        primaryMetadataName: 'viewFieldGroup',
        operationType: CrudOperationType.CREATE,
      });
    },
    [createManyViewFieldGroupsMutation, performViewEntityAPIPersistOperation],
  );

  const performViewFieldGroupAPIUpdate = useCallback(
    async (
      updateViewFieldGroupInputs: MutationUpdateViewFieldGroupArgs[],
    ): Promise<
      MetadataRequestResult<UpdateViewFieldGroupMutationResult[] | null>
    > => {
      if (updateViewFieldGroupInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      return performViewEntityAPIPersistOperation({
        persist: async () => {
          const results = await Promise.all(
            updateViewFieldGroupInputs.map((variables) =>
              updateViewFieldGroupMutation({
                variables,
              }),
            ),
          );

          return results.map((result) => result.data).filter(isDefined);
        },
        syncMetadataStore: (updatedData, { updateInDraft }) =>
          updateInDraft(
            'viewFieldGroups',
            updatedData.map((data) =>
              toFlatViewFieldGroup(data.updateViewFieldGroup),
            ),
          ),
        primaryMetadataName: 'viewFieldGroup',
        operationType: CrudOperationType.UPDATE,
      });
    },
    [updateViewFieldGroupMutation, performViewEntityAPIPersistOperation],
  );

  const performViewFieldGroupAPIDelete = useCallback(
    async (
      deleteViewFieldGroupInputs: MutationDeleteViewFieldGroupArgs[],
    ): Promise<
      MetadataRequestResult<DeleteViewFieldGroupMutationResult[] | null>
    > => {
      if (deleteViewFieldGroupInputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      return performViewEntityAPIPersistOperation({
        persist: async () => {
          const results = await Promise.all(
            deleteViewFieldGroupInputs.map((variables) =>
              deleteViewFieldGroupMutation({
                variables,
              }),
            ),
          );

          return results.map((result) => result.data).filter(isDefined);
        },
        syncMetadataStore: (_deletedData, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewFieldGroups',
            itemIds: deleteViewFieldGroupInputs.map(
              (variables) => variables.input.id,
            ),
          }),
        primaryMetadataName: 'viewFieldGroup',
        operationType: CrudOperationType.DELETE,
      });
    },
    [deleteViewFieldGroupMutation, performViewEntityAPIPersistOperation],
  );

  return {
    performViewFieldGroupAPICreate,
    performViewFieldGroupAPIUpdate,
    performViewFieldGroupAPIDelete,
  };
};
