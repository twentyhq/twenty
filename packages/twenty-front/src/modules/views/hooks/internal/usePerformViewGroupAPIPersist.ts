import { useCallback } from 'react';

import { type FlatViewGroup } from '@/metadata-store/types/FlatViewGroup';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { usePerformViewEntityAPIPersistOperation } from '@/views/hooks/internal/usePerformViewEntityAPIPersistOperation';
import { useMutation } from '@apollo/client/react';
import { isNonEmptyArray } from '@sniptt/guards';
import { CrudOperationType } from 'twenty-shared/types';
import {
  type CreateManyViewGroupsMutationVariables,
  type UpdateManyViewGroupsMutationVariables,
  CreateManyViewGroupsDocument,
  UpdateManyViewGroupsDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewGroupAPIPersist = () => {
  const [updateManyViewGroupsMutation] = useMutation(
    UpdateManyViewGroupsDocument,
  );

  const [createManyViewGroupsMutation] = useMutation(
    CreateManyViewGroupsDocument,
  );

  const { performViewEntityAPIPersistOperation } =
    usePerformViewEntityAPIPersistOperation('viewGroup');

  const performViewGroupAPIUpdate = useCallback(
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

      return performViewEntityAPIPersistOperation({
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
    [updateManyViewGroupsMutation, performViewEntityAPIPersistOperation],
  );

  const performViewGroupAPICreate = useCallback(
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

      return performViewEntityAPIPersistOperation({
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
    [createManyViewGroupsMutation, performViewEntityAPIPersistOperation],
  );

  return {
    performViewGroupAPIUpdate,
    performViewGroupAPICreate,
  };
};
