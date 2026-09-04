import { useCallback } from 'react';

import { type FlatViewGroup } from '@/metadata-store/types/FlatViewGroup';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { usePerformViewEntityApiPersistOperation } from '@/views/hooks/internal/usePerformViewEntityApiPersistOperation';
import { useMutation } from '@apollo/client/react';
import { isNonEmptyArray } from '@sniptt/guards';
import { CrudOperationType } from 'twenty-shared/types';
import {
  type CreateManyViewGroupsMutationVariables,
  type UpdateManyViewGroupsMutationVariables,
  CreateManyViewGroupsDocument,
  UpdateManyViewGroupsDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewGroupApiPersist = () => {
  const [updateManyViewGroupsMutation] = useMutation(
    UpdateManyViewGroupsDocument,
  );

  const [createManyViewGroupsMutation] = useMutation(
    CreateManyViewGroupsDocument,
  );

  const { performViewEntityApiPersistOperation } =
    usePerformViewEntityApiPersistOperation('viewGroup');

  const performViewGroupApiUpdate = useCallback(
    async (
      updateViewGroupInputs: UpdateManyViewGroupsMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<
        ReturnType<typeof updateManyViewGroupsMutation>
      > | null>
    > => {
      if (!isNonEmptyArray(updateViewGroupInputs.inputs)) {
        return {
          status: 'successful',
          response: null,
        };
      }

      return performViewEntityApiPersistOperation({
        persist: () =>
          updateManyViewGroupsMutation({
            variables: updateViewGroupInputs,
          }),
        applyResultToDraft: (result, { updateInDraft }) =>
          updateInDraft(
            'viewGroups',
            (result.data?.updateManyViewGroups ?? []).map(
              ({ __typename, ...viewGroup }) => viewGroup as FlatViewGroup,
            ),
          ),
        operationType: CrudOperationType.UPDATE,
      });
    },
    [updateManyViewGroupsMutation, performViewEntityApiPersistOperation],
  );

  const performViewGroupApiCreate = useCallback(
    async (
      createViewGroupInputs: CreateManyViewGroupsMutationVariables,
    ): Promise<
      MetadataRequestResult<Awaited<
        ReturnType<typeof createManyViewGroupsMutation>
      > | null>
    > => {
      if (!isNonEmptyArray(createViewGroupInputs.inputs)) {
        return {
          status: 'successful',
          response: null,
        };
      }

      return performViewEntityApiPersistOperation({
        persist: () =>
          createManyViewGroupsMutation({
            variables: createViewGroupInputs,
          }),
        applyResultToDraft: (result, { addToDraft }) =>
          addToDraft({
            key: 'viewGroups',
            items: (result.data?.createManyViewGroups ?? []).map(
              ({ __typename, ...viewGroup }) => viewGroup as FlatViewGroup,
            ),
          }),
        operationType: CrudOperationType.CREATE,
      });
    },
    [createManyViewGroupsMutation, performViewEntityApiPersistOperation],
  );

  return {
    performViewGroupApiUpdate,
    performViewGroupApiCreate,
  };
};
