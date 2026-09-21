import { useCallback } from 'react';

import { type FlatViewFilterGroup } from '@/metadata-store/types/FlatViewFilterGroup';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { usePerformViewEntityApiPersistOperation } from '@/views/hooks/internal/usePerformViewEntityApiPersistOperation';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { useMutation } from '@apollo/client/react';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  CreateViewFilterGroupDocument,
  DestroyViewFilterGroupDocument,
  UpdateViewFilterGroupDocument,
} from '~/generated-metadata/graphql';

export const usePerformViewFilterGroupApiPersist = () => {
  const [createViewFilterGroupMutation] = useMutation(
    CreateViewFilterGroupDocument,
  );
  const [updateViewFilterGroupMutation] = useMutation(
    UpdateViewFilterGroupDocument,
  );
  const [destroyViewFilterGroupMutation] = useMutation(
    DestroyViewFilterGroupDocument,
  );

  const {
    performViewEntityApiPersistOperation,
    performViewEntityApiPersistBatchOperation,
  } = usePerformViewEntityApiPersistOperation('viewFilterGroup');

  const createViewFilterGroupRecord = useCallback(
    async (viewFilterGroup: ViewFilterGroup, view: Pick<GraphQLView, 'id'>) => {
      const result = await createViewFilterGroupMutation({
        variables: {
          input: {
            id: viewFilterGroup.id,
            viewId: view.id,
            parentViewFilterGroupId: viewFilterGroup.parentViewFilterGroupId,
            logicalOperator: viewFilterGroup.logicalOperator,
            positionInViewFilterGroup:
              viewFilterGroup.positionInViewFilterGroup,
          },
        },
      });

      if (!isDefined(result.data)) {
        throw new Error('Failed to create view filter group');
      }

      return { newRecord: result.data.createViewFilterGroup };
    },
    [createViewFilterGroupMutation],
  );

  const performViewFilterGroupApiCreate = useCallback(
    async (
      viewFilterGroupsToCreate: ViewFilterGroup[],
      view: Pick<GraphQLView, 'id'>,
    ): Promise<MetadataRequestResult<string[]>> => {
      const oldToNewId = new Map<string, string>();
      const newRecordIds: string[] = [];

      for (const viewFilterGroupToCreate of viewFilterGroupsToCreate) {
        const newParentViewFilterGroupId = isDefined(
          viewFilterGroupToCreate.parentViewFilterGroupId,
        )
          ? (oldToNewId.get(viewFilterGroupToCreate.parentViewFilterGroupId) ??
            viewFilterGroupToCreate.parentViewFilterGroupId)
          : undefined;

        const result = await performViewEntityApiPersistOperation({
          persist: () =>
            createViewFilterGroupRecord(
              {
                ...viewFilterGroupToCreate,
                parentViewFilterGroupId: newParentViewFilterGroupId,
              },
              view,
            ),
          applyResultToDraft: ({ newRecord }, { addToDraft }) => {
            const { __typename, ...viewFilterGroup } = newRecord;
            return addToDraft({
              key: 'viewFilterGroups',
              items: [viewFilterGroup as FlatViewFilterGroup],
            });
          },
          operationType: CrudOperationType.CREATE,
        });

        if (result.status === 'failed') {
          return result;
        }

        oldToNewId.set(
          viewFilterGroupToCreate.id,
          result.response.newRecord.id,
        );
        newRecordIds.push(result.response.newRecord.id);
      }

      return {
        status: 'successful',
        response: newRecordIds,
      };
    },
    [createViewFilterGroupRecord, performViewEntityApiPersistOperation],
  );

  const performViewFilterGroupApiUpdate = useCallback(
    (viewFilterGroupsToUpdate: ViewFilterGroup[]) =>
      performViewEntityApiPersistBatchOperation({
        inputs: viewFilterGroupsToUpdate,
        mutate: (viewFilterGroup) =>
          updateViewFilterGroupMutation({
            variables: {
              id: viewFilterGroup.id,
              input: {
                parentViewFilterGroupId:
                  viewFilterGroup.parentViewFilterGroupId,
                logicalOperator: viewFilterGroup.logicalOperator,
                positionInViewFilterGroup:
                  viewFilterGroup.positionInViewFilterGroup,
              },
            },
          }),
        applyResultToDraft: (fulfilledMutations, { updateInDraft }) =>
          updateInDraft(
            'viewFilterGroups',
            fulfilledMutations
              .map(({ result }) => result.data?.updateViewFilterGroup)
              .filter(isDefined)
              .map(
                ({ __typename, ...viewFilterGroup }) =>
                  viewFilterGroup as FlatViewFilterGroup,
              ),
          ),
        operationType: CrudOperationType.UPDATE,
      }),
    [updateViewFilterGroupMutation, performViewEntityApiPersistBatchOperation],
  );

  const performViewFilterGroupApiDestroy = useCallback(
    (viewFilterGroupIdsToDestroy: string[]) =>
      performViewEntityApiPersistBatchOperation({
        inputs: viewFilterGroupIdsToDestroy,
        mutate: (viewFilterGroupId) =>
          destroyViewFilterGroupMutation({
            variables: {
              id: viewFilterGroupId,
            },
          }),
        applyResultToDraft: (fulfilledMutations, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewFilterGroups',
            itemIds: fulfilledMutations.map(({ input }) => input),
          }),
        operationType: CrudOperationType.DESTROY,
      }),
    [destroyViewFilterGroupMutation, performViewEntityApiPersistBatchOperation],
  );

  return {
    performViewFilterGroupApiCreate,
    performViewFilterGroupApiUpdate,
    performViewFilterGroupApiDestroy,
  };
};
