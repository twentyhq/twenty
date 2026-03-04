import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { useApolloClient } from '@apollo/client';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type CoreViewSort } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { useStore } from 'jotai';

export const useTriggerViewSortOptimisticEffect = () => {
  const store = useStore();
  const apolloClient = useApolloClient();

  const cache = apolloClient.cache;

  const triggerViewSortOptimisticEffect = useCallback(
    ({
      createdViewSorts = [],
      updatedViewSorts = [],
      deletedViewSorts = [],
    }: {
      createdViewSorts?: Omit<CoreViewSort, 'workspaceId'>[];
      updatedViewSorts?: Omit<CoreViewSort, 'workspaceId'>[];
      deletedViewSorts?: Pick<CoreViewSort, 'id' | 'viewId'>[];
    }) => {
      const coreViews = store.get(coreViewsState.atom);
      let newCoreViews = [...coreViews];

      createdViewSorts.forEach((createdViewSort) => {
        cache.modify<CoreViewWithRelations>({
          id: cache.identify({
            __typename: 'CoreView',
            id: createdViewSort.viewId,
          }),
          fields: {
            viewSorts: (existingViewSorts, { toReference }) => [
              ...(existingViewSorts ?? []),
              toReference(createdViewSort),
            ],
          },
        });
        const toBeModifiedCoreView = newCoreViews.find(
          (coreView) => coreView.id === createdViewSort.viewId,
        );
        if (isDefined(toBeModifiedCoreView)) {
          newCoreViews = [
            ...newCoreViews.filter(
              (coreView) => coreView.id !== createdViewSort.viewId,
            ),
            {
              ...toBeModifiedCoreView,
              viewSorts: [...toBeModifiedCoreView.viewSorts, createdViewSort],
            },
          ];
        }
      });

      updatedViewSorts.forEach((updatedViewSort) => {
        cache.modify<CoreViewWithRelations>({
          id: cache.identify({
            __typename: 'CoreView',
            id: updatedViewSort.viewId,
          }),
          fields: {
            viewSorts: (existingViewSorts, { readField, toReference }) =>
              existingViewSorts.map((viewSort) => {
                const viewSortId = readField<string>('id', viewSort);
                if (viewSortId === updatedViewSort.id) {
                  return toReference(updatedViewSort);
                }
                return viewSort;
              }),
          },
        });
        const toBeModifiedCoreView = newCoreViews.find(
          (coreView) => coreView.id === updatedViewSort.viewId,
        );
        if (isDefined(toBeModifiedCoreView)) {
          newCoreViews = [
            ...newCoreViews.filter(
              (coreView) => coreView.id !== updatedViewSort.viewId,
            ),
            {
              ...toBeModifiedCoreView,
              viewSorts: [
                ...toBeModifiedCoreView.viewSorts.filter(
                  (viewSort) => viewSort.id !== updatedViewSort.id,
                ),
                updatedViewSort,
              ],
            },
          ];
        }
      });

      deletedViewSorts.forEach(
        (deletedViewSort: Pick<CoreViewSort, 'id' | 'viewId'>) => {
          cache.modify<CoreViewWithRelations>({
            id: cache.identify({
              __typename: 'CoreView',
              id: deletedViewSort.viewId,
            }),
            fields: {
              viewSorts: (existingViewSorts, { readField }) =>
                existingViewSorts.filter(
                  (viewSort) =>
                    readField('id', viewSort) !== deletedViewSort.id,
                ),
            },
          });
          const toBeModifiedCoreView = newCoreViews.find(
            (coreView) => coreView.id === deletedViewSort.viewId,
          );

          if (isDefined(toBeModifiedCoreView)) {
            newCoreViews = [
              ...newCoreViews.filter(
                (coreView) => coreView.id !== deletedViewSort.viewId,
              ),
              {
                ...toBeModifiedCoreView,
                viewSorts: toBeModifiedCoreView.viewSorts.filter(
                  (viewSort) => viewSort.id !== deletedViewSort.id,
                ),
              },
            ];
          }
        },
      );

      if (!isDeeplyEqual(coreViews, newCoreViews)) {
        store.set(coreViewsState.atom, newCoreViews);
      }
    },
    [cache, store],
  );

  return {
    triggerViewSortOptimisticEffect,
  };
};
