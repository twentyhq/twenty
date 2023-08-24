import { useCallback } from 'react';

import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { sortsScopedState } from '@/ui/filter-n-sort/states/sortsScopedState';
import type { FilterDefinitionByEntity } from '@/ui/filter-n-sort/types/FilterDefinitionByEntity';
import type { SortType } from '@/ui/filter-n-sort/types/interface';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import {
  type TableView,
  tableViewsByIdState,
  tableViewsState,
} from '@/ui/table/states/tableViewsState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import {
  useCreateViewsMutation,
  useDeleteViewsMutation,
  useGetViewsQuery,
  useUpdateViewMutation,
  ViewType,
} from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useViewFilters } from './useViewFilters';
import { useViewSorts } from './useViewSorts';

export const useViews = <Entity, SortField>({
  availableFilters,
  availableSorts,
  objectId,
}: {
  availableFilters: FilterDefinitionByEntity<Entity>[];
  availableSorts: SortType<SortField>[];
  objectId: 'company' | 'person';
}) => {
  const [views, setViews] = useRecoilScopedState(
    tableViewsState,
    TableRecoilScopeContext,
  );
  const viewsById = useRecoilScopedValue(
    tableViewsByIdState,
    TableRecoilScopeContext,
  );
  const selectedFilters = useRecoilScopedValue(
    filtersScopedState,
    TableRecoilScopeContext,
  );
  const selectedSorts = useRecoilScopedValue(
    sortsScopedState,
    TableRecoilScopeContext,
  );

  const [createViewsMutation] = useCreateViewsMutation();
  const [updateViewMutation] = useUpdateViewMutation();
  const [deleteViewsMutation] = useDeleteViewsMutation();

  const { createViewFilters } = useViewFilters({ availableFilters });
  const { createViewSorts } = useViewSorts({ availableSorts });

  const createViews = useCallback(
    async (views: TableView[]) => {
      if (!views.length) return;

      await createViewsMutation({
        variables: {
          data: views.map((view) => ({
            ...view,
            objectId,
            type: ViewType.Table,
          })),
        },
      });

      await Promise.all(
        views.flatMap((view) => [
          createViewFilters(selectedFilters, view.id),
          createViewSorts(selectedSorts, view.id),
        ]),
      );
    },
    [
      createViewFilters,
      createViewSorts,
      createViewsMutation,
      objectId,
      selectedFilters,
      selectedSorts,
    ],
  );

  const updateViews = useCallback(
    (views: TableView[]) => {
      if (!views.length) return;

      return Promise.all(
        views.map((view) =>
          updateViewMutation({
            variables: {
              data: { name: view.name },
              where: { id: view.id },
            },
          }),
        ),
      );
    },
    [updateViewMutation],
  );

  const deleteViews = useCallback(
    (viewIds: string[]) => {
      if (!viewIds.length) return;

      return deleteViewsMutation({
        variables: {
          where: {
            id: { in: viewIds },
          },
        },
      });
    },
    [deleteViewsMutation],
  );

  const { refetch } = useGetViewsQuery({
    variables: {
      where: {
        objectId: { equals: objectId },
      },
    },
    onCompleted: (data) => {
      const nextViews = data.views.map((view) => ({
        id: view.id,
        name: view.name,
      }));

      if (!isDeeplyEqual(views, nextViews)) setViews(nextViews);
    },
  });

  const handleViewsChange = useCallback(
    async (nextViews: TableView[]) => {
      const viewsToCreate = nextViews.filter(
        (nextView) => !viewsById[nextView.id],
      );
      await createViews(viewsToCreate);

      const viewsToUpdate = nextViews.filter(
        (nextView) =>
          viewsById[nextView.id] &&
          viewsById[nextView.id].name !== nextView.name,
      );
      await updateViews(viewsToUpdate);

      const nextViewIds = nextViews.map((nextView) => nextView.id);
      const viewIdsToDelete = Object.keys(viewsById).filter(
        (previousViewId) => !nextViewIds.includes(previousViewId),
      );
      await deleteViews(viewIdsToDelete);

      return refetch();
    },
    [createViews, deleteViews, refetch, updateViews, viewsById],
  );

  return { handleViewsChange };
};
