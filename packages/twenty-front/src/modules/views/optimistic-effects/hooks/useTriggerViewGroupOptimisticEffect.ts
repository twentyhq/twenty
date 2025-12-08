import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type CoreViewGroup } from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type UpdatedDeletedCoreViewGroup = {
  createdViewGroups?: Omit<CoreViewGroup, 'workspaceId'>[];
  updatedViewGroups?: Omit<CoreViewGroup, 'workspaceId'>[];
  deletedViewGroups?: Pick<CoreViewGroup, 'id' | 'viewId'>[];
};
export const useTriggerViewGroupOptimisticEffect = () => {
  const apolloClient = useApolloClient();

  const cache = apolloClient.cache;

  const triggerViewGroupOptimisticEffect = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        createdViewGroups = [],
        updatedViewGroups = [],
        deletedViewGroups = [],
      }: UpdatedDeletedCoreViewGroup) => {
        const coreViews = getSnapshotValue(snapshot, coreViewsState);
        let newCoreViews = [...coreViews];

        createdViewGroups.forEach((createdViewGroup) => {
          cache.modify<CoreViewWithRelations>({
            id: cache.identify({
              __typename: 'CoreView',
              id: createdViewGroup.viewId,
            }),
            fields: {
              viewGroups: (existingViewGroups, { toReference }) => [
                ...(existingViewGroups ?? []),
                toReference(createdViewGroup),
              ],
            },
          });
          const toBeModifiedCoreView = newCoreViews.find(
            (coreView) => coreView.id === createdViewGroup.viewId,
          );
          if (isDefined(toBeModifiedCoreView)) {
            newCoreViews = [
              ...newCoreViews.filter(
                (coreView) => coreView.id !== createdViewGroup.viewId,
              ),
              {
                ...toBeModifiedCoreView,
                viewGroups: [
                  ...toBeModifiedCoreView.viewGroups,
                  createdViewGroup,
                ],
              },
            ];
          }
        });

        updatedViewGroups.forEach((updatedViewGroup) => {
          cache.modify<CoreViewWithRelations>({
            id: cache.identify({
              __typename: 'CoreView',
              id: updatedViewGroup.viewId,
            }),
            fields: {
              viewGroups: (existingViewGroups, { readField, toReference }) =>
                existingViewGroups.map((viewGroup) => {
                  const viewGroupId = readField<string>('id', viewGroup);
                  if (viewGroupId === updatedViewGroup.id) {
                    return toReference(updatedViewGroup);
                  }
                  return viewGroup;
                }),
            },
          });
          const toBeModifiedCoreView = newCoreViews.find(
            (coreView) => coreView.id === updatedViewGroup.viewId,
          );
          if (isDefined(toBeModifiedCoreView)) {
            newCoreViews = [
              ...newCoreViews.filter(
                (coreView) => coreView.id !== updatedViewGroup.viewId,
              ),
              {
                ...toBeModifiedCoreView,
                viewGroups: [
                  ...toBeModifiedCoreView.viewGroups.filter(
                    (viewGroup) => viewGroup.id !== updatedViewGroup.id,
                  ),
                  updatedViewGroup,
                ],
              },
            ];
          }
        });

        deletedViewGroups.forEach((deletedViewGroup) => {
          cache.modify<CoreViewWithRelations>({
            id: cache.identify({
              __typename: 'CoreView',
              id: deletedViewGroup.viewId,
            }),
            fields: {
              viewGroups: (existingViewGroups, { readField }) =>
                existingViewGroups.filter(
                  (viewGroup) =>
                    readField('id', viewGroup) !== deletedViewGroup.id,
                ),
            },
          });
          const toBeModifiedCoreView = newCoreViews.find(
            (coreView) => coreView.id === deletedViewGroup.viewId,
          );

          if (isDefined(toBeModifiedCoreView)) {
            newCoreViews = [
              ...newCoreViews.filter(
                (coreView) => coreView.id !== deletedViewGroup.viewId,
              ),
              {
                ...toBeModifiedCoreView,
                viewGroups: toBeModifiedCoreView.viewGroups.filter(
                  (viewGroup) => viewGroup.id !== deletedViewGroup.id,
                ),
              },
            ];
          }
        });

        if (!isDeeplyEqual(coreViews, newCoreViews)) {
          set(coreViewsState, newCoreViews);
        }
      },
    [cache],
  );

  return {
    triggerViewGroupOptimisticEffect,
  };
};
