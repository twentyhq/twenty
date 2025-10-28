import { useCallback } from 'react';

import { CREATE_CORE_VIEW_FILTER_GROUP } from '@/views/graphql/mutations/createCoreViewFilterGroup';
import { DESTROY_CORE_VIEW_FILTER_GROUP } from '@/views/graphql/mutations/destroyCoreViewFilterGroup';
import { UPDATE_CORE_VIEW_FILTER_GROUP } from '@/views/graphql/mutations/updateCoreViewFilterGroup';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { useApolloClient } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import { type CoreViewFilterGroup } from '~/generated/graphql';

export const usePersistViewFilterGroupRecords = () => {
  const apolloClient = useApolloClient();

  const createCoreViewFilterGroupRecord = useCallback(
    async (viewFilterGroup: ViewFilterGroup, view: Pick<GraphQLView, 'id'>) => {
      const result = await apolloClient.mutate<{
        createCoreViewFilterGroup: ViewFilterGroup;
      }>({
        mutation: CREATE_CORE_VIEW_FILTER_GROUP,
        variables: {
          input: {
            id: viewFilterGroup.id,
            viewId: view.id,
            parentViewFilterGroupId: viewFilterGroup.parentViewFilterGroupId,
            logicalOperator: viewFilterGroup.logicalOperator,
            positionInViewFilterGroup:
              viewFilterGroup.positionInViewFilterGroup,
          } satisfies Partial<CoreViewFilterGroup>,
        },
      });

      if (!result.data) {
        throw new Error('Failed to create core view filter group');
      }

      return { newRecordId: result.data.createCoreViewFilterGroup.id };
    },
    [apolloClient],
  );

  const createViewFilterGroups = useCallback(
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

        const { newRecordId } = await createCoreViewFilterGroupRecord(
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
          throw new Error('Failed to create core view filter group');
        }
        return newId;
      });

      return newRecordIds;
    },
    [createCoreViewFilterGroupRecord],
  );

  const updateViewFilterGroups = useCallback(
    (viewFilterGroupsToUpdate: ViewFilterGroup[]) => {
      if (!viewFilterGroupsToUpdate.length) return;
      return Promise.all(
        viewFilterGroupsToUpdate.map((viewFilterGroup) =>
          apolloClient.mutate<{ updateCoreViewFilterGroup: ViewFilterGroup }>({
            mutation: UPDATE_CORE_VIEW_FILTER_GROUP,
            variables: {
              id: viewFilterGroup.id,
              input: {
                parentViewFilterGroupId:
                  viewFilterGroup.parentViewFilterGroupId,
                logicalOperator: viewFilterGroup.logicalOperator,
                positionInViewFilterGroup:
                  viewFilterGroup.positionInViewFilterGroup,
              } satisfies Partial<CoreViewFilterGroup>,
            },
          }),
        ),
      );
    },
    [apolloClient],
  );

  const deleteViewFilterGroups = useCallback(
    (viewFilterGroupIdsToDelete: string[]) => {
      if (!viewFilterGroupIdsToDelete.length) return;
      return Promise.all(
        viewFilterGroupIdsToDelete.map((viewFilterGroupId) =>
          apolloClient.mutate<{ destroyCoreViewFilterGroup: ViewFilterGroup }>({
            mutation: DESTROY_CORE_VIEW_FILTER_GROUP,
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
    createViewFilterGroups,
    updateViewFilterGroups,
    deleteViewFilterGroups,
  };
};
