import { useCallback } from 'react';

import { CREATE_VIEW_FILTER_GROUP } from '@/views/graphql/mutations/createViewFilterGroup';
import { DESTROY_VIEW_FILTER_GROUP } from '@/views/graphql/mutations/destroyViewFilterGroup';
import { UPDATE_VIEW_FILTER_GROUP } from '@/views/graphql/mutations/updateViewFilterGroup';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { useApolloClient } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { type ViewFilterGroup as GqlViewFilterGroup } from '~/generated-metadata/graphql';

export const usePerformViewFilterGroupAPIPersist = () => {
  const apolloClient = useApolloClient();

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

      return { newRecordId: result.data.createViewFilterGroup.id };
    },
    [apolloClient],
  );

  const performViewFilterGroupAPICreate = useCallback(
    async (
      viewFilterGroupsToCreate: ViewFilterGroup[],
      view: Pick<GraphQLView, 'id'>,
    ) => {
      if (!viewFilterGroupsToCreate.length) return [];

      const oldToNewId = new Map<string, string>();

      for (const viewFilterGroupToCreate of viewFilterGroupsToCreate) {
        const newParentViewFilterGroupId = isDefined(
          viewFilterGroupToCreate.parentViewFilterGroupId,
        )
          ? (oldToNewId.get(viewFilterGroupToCreate.parentViewFilterGroupId) ??
            viewFilterGroupToCreate.parentViewFilterGroupId)
          : undefined;

        const { newRecordId } = await createViewFilterGroupRecord(
          {
            ...viewFilterGroupToCreate,
            parentViewFilterGroupId: newParentViewFilterGroupId,
          },
          view,
        );

        oldToNewId.set(viewFilterGroupToCreate.id, newRecordId);
      }

      const newRecordIds = viewFilterGroupsToCreate.map((viewFilterGroup) => {
        const newId = oldToNewId.get(viewFilterGroup.id);
        if (!newId) {
          throw new Error('Failed to create view filter group');
        }
        return newId;
      });

      return newRecordIds;
    },
    [createViewFilterGroupRecord],
  );

  const performViewFilterGroupAPIUpdate = useCallback(
    (viewFilterGroupsToUpdate: ViewFilterGroup[]) => {
      if (!viewFilterGroupsToUpdate.length) return;
      return Promise.all(
        viewFilterGroupsToUpdate.map((viewFilterGroup) =>
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
        ),
      );
    },
    [apolloClient],
  );

  const performViewFilterGroupAPIDelete = useCallback(
    (viewFilterGroupIdsToDelete: string[]) => {
      if (!viewFilterGroupIdsToDelete.length) return;
      return Promise.all(
        viewFilterGroupIdsToDelete.map((viewFilterGroupId) =>
          apolloClient.mutate<{ destroyViewFilterGroup: ViewFilterGroup }>({
            mutation: DESTROY_VIEW_FILTER_GROUP,
            variables: {
              id: viewFilterGroupId,
            },
          }),
        ),
      );
    },
    [apolloClient],
  );

  return {
    performViewFilterGroupAPICreate,
    performViewFilterGroupAPIUpdate,
    performViewFilterGroupAPIDelete,
  };
};
