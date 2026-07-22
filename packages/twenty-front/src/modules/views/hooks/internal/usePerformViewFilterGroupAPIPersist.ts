import { useCallback } from 'react';

import { type FlatViewFilterGroup } from '@/metadata-store/types/FlatViewFilterGroup';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { CREATE_VIEW_FILTER_GROUP } from '@/views/graphql/mutations/createViewFilterGroup';
import { DESTROY_VIEW_FILTER_GROUP } from '@/views/graphql/mutations/destroyViewFilterGroup';
import { UPDATE_VIEW_FILTER_GROUP } from '@/views/graphql/mutations/updateViewFilterGroup';
import { usePerformViewEntityAPIPersistOperation } from '@/views/hooks/internal/usePerformViewEntityAPIPersistOperation';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { useApolloClient } from '@apollo/client/react';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ViewFilterGroup as GqlViewFilterGroup } from '~/generated-metadata/graphql';

const toFlatViewFilterGroup = (
  viewFilterGroup: ViewFilterGroup,
): FlatViewFilterGroup => ({
  id: viewFilterGroup.id,
  viewId: viewFilterGroup.viewId,
  parentViewFilterGroupId: viewFilterGroup.parentViewFilterGroupId,
  logicalOperator: viewFilterGroup.logicalOperator,
  positionInViewFilterGroup: viewFilterGroup.positionInViewFilterGroup,
});

export const usePerformViewFilterGroupAPIPersist = () => {
  const apolloClient = useApolloClient();

  const {
    performViewEntityAPIPersistOperation,
    performViewEntityAPIPersistBatchOperation,
  } = usePerformViewEntityAPIPersistOperation('viewFilterGroup');

  const createViewFilterGroupRecord = useCallback(
    async (viewFilterGroup: ViewFilterGroup, view: Pick<GraphQLView, 'id'>) => {
      const result = await apolloClient.mutate<{
        createViewFilterGroup: ViewFilterGroup;
      }>({
        mutation: CREATE_VIEW_FILTER_GROUP,
        variables: {
          input: {
            id: viewFilterGroup.id,
            viewId: view.id,
            parentViewFilterGroupId: viewFilterGroup.parentViewFilterGroupId,
            logicalOperator: viewFilterGroup.logicalOperator,
            positionInViewFilterGroup:
              viewFilterGroup.positionInViewFilterGroup,
          } satisfies Partial<GqlViewFilterGroup>,
        },
      });

      if (!result.data) {
        throw new Error('Failed to create view filter group');
      }

      return { newRecord: result.data.createViewFilterGroup };
    },
    [apolloClient],
  );

  const performViewFilterGroupAPICreate = useCallback(
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

        const result = await performViewEntityAPIPersistOperation({
          persist: () =>
            createViewFilterGroupRecord(
              {
                ...viewFilterGroupToCreate,
                parentViewFilterGroupId: newParentViewFilterGroupId,
              },
              view,
            ),
          syncMetadataStore: ({ newRecord }, { addToDraft }) =>
            addToDraft({
              key: 'viewFilterGroups',
              items: [toFlatViewFilterGroup(newRecord)],
            }),
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
    [createViewFilterGroupRecord, performViewEntityAPIPersistOperation],
  );

  const performViewFilterGroupAPIUpdate = useCallback(
    (viewFilterGroupsToUpdate: ViewFilterGroup[]) =>
      performViewEntityAPIPersistBatchOperation({
        inputs: viewFilterGroupsToUpdate,
        mutate: (viewFilterGroup) =>
          apolloClient.mutate<{ updateViewFilterGroup: ViewFilterGroup }>({
            mutation: UPDATE_VIEW_FILTER_GROUP,
            variables: {
              id: viewFilterGroup.id,
              input: {
                parentViewFilterGroupId:
                  viewFilterGroup.parentViewFilterGroupId,
                logicalOperator: viewFilterGroup.logicalOperator,
                positionInViewFilterGroup:
                  viewFilterGroup.positionInViewFilterGroup,
              } satisfies Partial<GqlViewFilterGroup>,
            },
          }),
        syncMetadataStore: (fulfilledMutations, { updateInDraft }) =>
          updateInDraft(
            'viewFilterGroups',
            fulfilledMutations
              .map(({ result }) => result.data?.updateViewFilterGroup)
              .filter(isDefined)
              .map(toFlatViewFilterGroup),
          ),
        operationType: CrudOperationType.UPDATE,
      }),
    [apolloClient, performViewEntityAPIPersistBatchOperation],
  );

  const performViewFilterGroupAPIDestroy = useCallback(
    (viewFilterGroupIdsToDestroy: string[]) =>
      performViewEntityAPIPersistBatchOperation({
        inputs: viewFilterGroupIdsToDestroy,
        mutate: (viewFilterGroupId) =>
          apolloClient.mutate<{ destroyViewFilterGroup: ViewFilterGroup }>({
            mutation: DESTROY_VIEW_FILTER_GROUP,
            variables: {
              id: viewFilterGroupId,
            },
          }),
        syncMetadataStore: (fulfilledMutations, { removeFromDraft }) =>
          removeFromDraft({
            key: 'viewFilterGroups',
            itemIds: fulfilledMutations.map(({ input }) => input),
          }),
        operationType: CrudOperationType.DESTROY,
      }),
    [apolloClient, performViewEntityAPIPersistBatchOperation],
  );

  return {
    performViewFilterGroupAPICreate,
    performViewFilterGroupAPIUpdate,
    performViewFilterGroupAPIDestroy,
  };
};
