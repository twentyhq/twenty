import { useCallback } from 'react';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatViewFilterGroup } from '@/metadata-store/types/FlatViewFilterGroup';
import { CREATE_VIEW_FILTER_GROUP } from '@/views/graphql/mutations/createViewFilterGroup';
import { DESTROY_VIEW_FILTER_GROUP } from '@/views/graphql/mutations/destroyViewFilterGroup';
import { UPDATE_VIEW_FILTER_GROUP } from '@/views/graphql/mutations/updateViewFilterGroup';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { useApolloClient } from '@apollo/client/react';
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

  const { addToDraft, updateInDraft, removeFromDraft, applyChanges } =
    useUpdateMetadataStoreDraft();

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
    ) => {
      if (!viewFilterGroupsToCreate.length) return [];

      const oldToNewId = new Map<string, string>();
      const createdFlatViewFilterGroups: FlatViewFilterGroup[] = [];

      for (const viewFilterGroupToCreate of viewFilterGroupsToCreate) {
        const newParentViewFilterGroupId = isDefined(
          viewFilterGroupToCreate.parentViewFilterGroupId,
        )
          ? (oldToNewId.get(viewFilterGroupToCreate.parentViewFilterGroupId) ??
            viewFilterGroupToCreate.parentViewFilterGroupId)
          : undefined;

        const { newRecord } = await createViewFilterGroupRecord(
          {
            ...viewFilterGroupToCreate,
            parentViewFilterGroupId: newParentViewFilterGroupId,
          },
          view,
        );

        oldToNewId.set(viewFilterGroupToCreate.id, newRecord.id);
        createdFlatViewFilterGroups.push(toFlatViewFilterGroup(newRecord));
      }

      // Write created view filter groups to the metadata store immediately so
      // a subsequent save doesn't diff against stale view data and re-send
      // the same create, which fails server-side on duplicate id
      addToDraft({
        key: 'viewFilterGroups',
        items: createdFlatViewFilterGroups,
      });
      applyChanges();

      const newRecordIds = viewFilterGroupsToCreate.map((viewFilterGroup) => {
        const newId = oldToNewId.get(viewFilterGroup.id);
        if (!newId) {
          throw new Error('Failed to create view filter group');
        }
        return newId;
      });

      return newRecordIds;
    },
    [createViewFilterGroupRecord, addToDraft, applyChanges],
  );

  const performViewFilterGroupAPIUpdate = useCallback(
    async (viewFilterGroupsToUpdate: ViewFilterGroup[]) => {
      if (!viewFilterGroupsToUpdate.length) return;
      const results = await Promise.all(
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

      const updatedFlatViewFilterGroups = results
        .map((result) => result.data?.updateViewFilterGroup)
        .filter(isDefined)
        .map(toFlatViewFilterGroup);

      updateInDraft('viewFilterGroups', updatedFlatViewFilterGroups);
      applyChanges();

      return results;
    },
    [apolloClient, updateInDraft, applyChanges],
  );

  const performViewFilterGroupAPIDestroy = useCallback(
    async (viewFilterGroupIdsToDestroy: string[]) => {
      if (!viewFilterGroupIdsToDestroy.length) return;
      const results = await Promise.all(
        viewFilterGroupIdsToDestroy.map((viewFilterGroupId) =>
          apolloClient.mutate<{ destroyViewFilterGroup: ViewFilterGroup }>({
            mutation: DESTROY_VIEW_FILTER_GROUP,
            variables: {
              id: viewFilterGroupId,
            },
          }),
        ),
      );

      removeFromDraft({
        key: 'viewFilterGroups',
        itemIds: viewFilterGroupIdsToDestroy,
      });
      applyChanges();

      return results;
    },
    [apolloClient, removeFromDraft, applyChanges],
  );

  return {
    performViewFilterGroupAPICreate,
    performViewFilterGroupAPIUpdate,
    performViewFilterGroupAPIDestroy,
  };
};
