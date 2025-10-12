import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type CoreViewFilter } from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
type UpdatedDeletedCoreViewFilter = {
  createdViewFilters?: Omit<CoreViewFilter, 'workspaceId'>[];
  updatedViewFilters?: Omit<CoreViewFilter, 'workspaceId'>[];
  deletedViewFilters?: Pick<CoreViewFilter, 'id' | 'viewId'>[];
};
export const useTriggerViewFilterOptimisticEffect = () => {
  const apolloClient = useApolloClient();

  const cache = apolloClient.cache;

  const triggerViewFilterOptimisticEffect = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        createdViewFilters = [],
        updatedViewFilters = [],
        deletedViewFilters = [],
      }: UpdatedDeletedCoreViewFilter) => {
        const coreViews = getSnapshotValue(snapshot, coreViewsState);
        let newCoreViews = [...coreViews];

        createdViewFilters.forEach((createdViewFilter) => {
          cache.modify<CoreViewWithRelations>({
            id: cache.identify({
              __typename: 'CoreView',
              id: createdViewFilter.viewId,
            }),
            fields: {
              viewFilters: (existingViewFilters, { toReference }) => [
                ...(existingViewFilters ?? []),
                toReference(createdViewFilter),
              ],
            },
          });
          const toBeModifiedCoreView = newCoreViews.find(
            (coreView) => coreView.id === createdViewFilter.viewId,
          );
          if (isDefined(toBeModifiedCoreView)) {
            newCoreViews = [
              ...newCoreViews.filter(
                (coreView) => coreView.id !== createdViewFilter.viewId,
              ),
              {
                ...toBeModifiedCoreView,
                viewFilters: [
                  ...toBeModifiedCoreView.viewFilters,
                  createdViewFilter,
                ],
              },
            ];
          }
        });

        updatedViewFilters.forEach((updatedViewFilter) => {
          cache.modify<CoreViewWithRelations>({
            id: cache.identify({
              __typename: 'CoreView',
              id: updatedViewFilter.viewId,
            }),
            fields: {
              viewFilters: (existingViewFilters, { readField, toReference }) =>
                existingViewFilters.map((viewFilter) => {
                  const viewFilterId = readField<string>('id', viewFilter);
                  if (viewFilterId === updatedViewFilter.id) {
                    return toReference(updatedViewFilter);
                  }
                  return viewFilter;
                }),
            },
          });
          const toBeModifiedCoreView = newCoreViews.find(
            (coreView) => coreView.id === updatedViewFilter.viewId,
          );
          if (isDefined(toBeModifiedCoreView)) {
            newCoreViews = [
              ...newCoreViews.filter(
                (coreView) => coreView.id !== updatedViewFilter.viewId,
              ),
              {
                ...toBeModifiedCoreView,
                viewFilters: [
                  ...toBeModifiedCoreView.viewFilters.filter(
                    (viewFilter) => viewFilter.id !== updatedViewFilter.id,
                  ),
                  updatedViewFilter,
                ],
              },
            ];
          }
        });

        deletedViewFilters.forEach(
          (deletedViewFilter: Pick<CoreViewFilter, 'id' | 'viewId'>) => {
            cache.modify<CoreViewWithRelations>({
              id: cache.identify({
                __typename: 'CoreView',
                id: deletedViewFilter.viewId,
              }),
              fields: {
                viewFilters: (existingViewFilters, { readField }) =>
                  existingViewFilters.filter(
                    (viewFilter) =>
                      readField('id', viewFilter) !== deletedViewFilter.id,
                  ),
              },
            });
            const toBeModifiedCoreView = newCoreViews.find(
              (coreView) => coreView.id === deletedViewFilter.viewId,
            );

            if (isDefined(toBeModifiedCoreView)) {
              newCoreViews = [
                ...newCoreViews.filter(
                  (coreView) => coreView.id !== deletedViewFilter.viewId,
                ),
                {
                  ...toBeModifiedCoreView,
                  viewFilters: toBeModifiedCoreView.viewFilters.filter(
                    (viewFilter) => viewFilter.id !== deletedViewFilter.id,
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
    triggerViewFilterOptimisticEffect,
  };
};
