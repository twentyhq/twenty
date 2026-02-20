import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type CoreViewFieldGroup } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type ViewFieldGroupForOptimisticEffect = Omit<
  CoreViewFieldGroup,
  'workspaceId'
>;

export const useTriggerViewFieldGroupOptimisticEffect = () => {
  const apolloClient = useApolloClient();

  const cache = apolloClient.cache;

  const triggerViewFieldGroupOptimisticEffect = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        createdViewFieldGroups = [],
        updatedViewFieldGroups = [],
        deletedViewFieldGroups = [],
      }: {
        createdViewFieldGroups?: ViewFieldGroupForOptimisticEffect[];
        updatedViewFieldGroups?: ViewFieldGroupForOptimisticEffect[];
        deletedViewFieldGroups?: Pick<CoreViewFieldGroup, 'id' | 'viewId'>[];
      }) => {
        const coreViews = getSnapshotValue(snapshot, coreViewsState);
        let newCoreViews = [...coreViews];

        createdViewFieldGroups.forEach((createdViewFieldGroup) => {
          cache.modify<CoreViewWithRelations>({
            id: cache.identify({
              __typename: 'CoreView',
              id: createdViewFieldGroup.viewId,
            }),
            fields: {
              viewFieldGroups: (existingViewFieldGroups, { toReference }) => [
                ...(existingViewFieldGroups ?? []),
                toReference(createdViewFieldGroup),
              ],
            },
          });
          const toBeModifiedCoreView = newCoreViews.find(
            (coreView) => coreView.id === createdViewFieldGroup.viewId,
          );
          if (isDefined(toBeModifiedCoreView)) {
            newCoreViews = [
              ...newCoreViews.filter(
                (coreView) => coreView.id !== createdViewFieldGroup.viewId,
              ),
              {
                ...toBeModifiedCoreView,
                viewFieldGroups: [
                  ...(toBeModifiedCoreView.viewFieldGroups ?? []),
                  createdViewFieldGroup,
                ],
              },
            ];
          }
        });

        updatedViewFieldGroups.forEach((updatedViewFieldGroup) => {
          cache.modify<CoreViewWithRelations>({
            id: cache.identify({
              __typename: 'CoreView',
              id: updatedViewFieldGroup.viewId,
            }),
            fields: {
              viewFieldGroups: (
                existingViewFieldGroups,
                { readField, toReference },
              ) =>
                existingViewFieldGroups?.map((viewFieldGroup) => {
                  const viewFieldGroupId = readField<string>(
                    'id',
                    viewFieldGroup,
                  );
                  if (viewFieldGroupId === updatedViewFieldGroup.id) {
                    return toReference(updatedViewFieldGroup);
                  }
                  return viewFieldGroup;
                }) ?? [],
            },
          });
          const toBeModifiedCoreView = newCoreViews.find(
            (coreView) => coreView.id === updatedViewFieldGroup.viewId,
          );
          if (isDefined(toBeModifiedCoreView)) {
            newCoreViews = [
              ...newCoreViews.filter(
                (coreView) => coreView.id !== updatedViewFieldGroup.viewId,
              ),
              {
                ...toBeModifiedCoreView,
                viewFieldGroups: [
                  ...(toBeModifiedCoreView.viewFieldGroups ?? []).filter(
                    (viewFieldGroup) =>
                      viewFieldGroup.id !== updatedViewFieldGroup.id,
                  ),
                  updatedViewFieldGroup,
                ],
              },
            ];
          }
        });

        deletedViewFieldGroups.forEach(
          (
            deletedViewFieldGroup: Pick<CoreViewFieldGroup, 'id' | 'viewId'>,
          ) => {
            cache.modify<CoreViewWithRelations>({
              id: cache.identify({
                __typename: 'CoreView',
                id: deletedViewFieldGroup.viewId,
              }),
              fields: {
                viewFieldGroups: (existingViewFieldGroups, { readField }) =>
                  existingViewFieldGroups?.filter(
                    (viewFieldGroup) =>
                      readField('id', viewFieldGroup) !==
                      deletedViewFieldGroup.id,
                  ) ?? [],
              },
            });
            const toBeModifiedCoreView = newCoreViews.find(
              (coreView) => coreView.id === deletedViewFieldGroup.viewId,
            );

            if (isDefined(toBeModifiedCoreView)) {
              newCoreViews = [
                ...newCoreViews.filter(
                  (coreView) => coreView.id !== deletedViewFieldGroup.viewId,
                ),
                {
                  ...toBeModifiedCoreView,
                  viewFieldGroups: (
                    toBeModifiedCoreView.viewFieldGroups ?? []
                  ).filter(
                    (viewFieldGroup) =>
                      viewFieldGroup.id !== deletedViewFieldGroup.id,
                  ),
                },
              ];
            }
          },
        );

        if (!isDeeplyEqual(coreViews, newCoreViews)) {
          set(coreViewsState, newCoreViews);
        }
      },
    [cache],
  );

  return {
    triggerViewFieldGroupOptimisticEffect,
  };
};
