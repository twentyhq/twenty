import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';

import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { sortsScopedState } from '@/ui/filter-n-sort/states/sortsScopedState';
import { FilterDefinitionByEntity } from '@/ui/filter-n-sort/types/FilterDefinitionByEntity';
import type { SortType } from '@/ui/filter-n-sort/types/interface';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import {
  type TableView,
  tableViewsByIdState,
  tableViewsState,
} from '@/ui/table/states/tableViewsState';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
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

export const useTableViews = <Entity, SortField>({
  availableFilters,
  availableSorts,
  objectId,
}: {
  availableFilters: FilterDefinitionByEntity<Entity>[];
  availableSorts: SortType<SortField>[];
  objectId: 'company' | 'person';
}) => {
  const tableScopeId = useContextScopeId(TableRecoilScopeContext);

  const [views, setViews] = useRecoilScopedState(
    tableViewsState,
    TableRecoilScopeContext,
  );
  const viewsById = useRecoilScopedValue(
    tableViewsByIdState,
    TableRecoilScopeContext,
  );

  const [createViewsMutation] = useCreateViewsMutation();
  const [updateViewMutation] = useUpdateViewMutation();
  const [deleteViewsMutation] = useDeleteViewsMutation();

  const { createViewFilters } = useViewFilters({ availableFilters });
  const { createViewSorts } = useViewSorts({ availableSorts });

  const createViews = useRecoilCallback(
    ({ snapshot }) =>
      async (views: TableView[]) => {
        if (!views.length) return;

        const selectedFilters = await snapshot.getPromise(
          filtersScopedState(tableScopeId),
        );
        const selectedSorts = await snapshot.getPromise(
          sortsScopedState(tableScopeId),
        );

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
      tableScopeId,
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
