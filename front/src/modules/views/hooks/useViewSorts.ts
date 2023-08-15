import { useCallback, useEffect } from 'react';
import { getOperationName } from '@apollo/client/utilities';

import {
  sortsByKeyScopedState,
  sortScopedState,
} from '@/ui/filter-n-sort/states/sortScopedState';
import type {
  SelectedSortType,
  SortType,
} from '@/ui/filter-n-sort/types/interface';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { currentTableViewIdState } from '@/ui/table/states/tableViewsState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import {
  useCreateViewSortsMutation,
  useDeleteViewSortsMutation,
  useGetViewSortsQuery,
  useUpdateViewSortMutation,
  ViewSortDirection,
} from '~/generated/graphql';

import { GET_VIEW_SORTS } from '../graphql/queries/getViewSorts';

export const useViewSorts = <SortField>({
  availableSorts,
}: {
  availableSorts: SortType<SortField>[];
}) => {
  const currentViewId = useRecoilScopedValue(
    currentTableViewIdState,
    TableRecoilScopeContext,
  );
  const [, setSorts] = useRecoilScopedState(
    sortScopedState,
    TableRecoilScopeContext,
  );
  const sortsByKey = useRecoilScopedValue(
    sortsByKeyScopedState,
    TableRecoilScopeContext,
  );

  useEffect(() => {
    if (!currentViewId) setSorts([]);
  }, [currentViewId, setSorts]);

  useGetViewSortsQuery({
    skip: !currentViewId,
    variables: {
      where: {
        viewId: { equals: currentViewId },
      },
    },
    onCompleted: (data) => {
      setSorts(
        data.viewSorts
          .map((viewSort) => {
            const availableSort = availableSorts.find(
              (sort) => sort.key === viewSort.key,
            );

            return availableSort
              ? {
                  ...availableSort,
                  label: viewSort.name,
                  order: viewSort.direction.toLowerCase(),
                }
              : undefined;
          })
          .filter((sort): sort is SelectedSortType<SortField> => !!sort),
      );
    },
  });

  const [createViewSortsMutation] = useCreateViewSortsMutation();
  const [updateViewSortMutation] = useUpdateViewSortMutation();
  const [deleteViewSortsMutation] = useDeleteViewSortsMutation();

  const createViewSorts = useCallback(
    (sorts: SelectedSortType<SortField>[]) => {
      if (!currentViewId || !sorts.length) return;

      return createViewSortsMutation({
        variables: {
          data: sorts.map((sort) => ({
            key: sort.key,
            direction: sort.order as ViewSortDirection,
            name: sort.label,
            viewId: currentViewId,
          })),
        },
        refetchQueries: [getOperationName(GET_VIEW_SORTS) ?? ''],
      });
    },
    [createViewSortsMutation, currentViewId],
  );

  const updateViewSorts = useCallback(
    (sorts: SelectedSortType<SortField>[]) => {
      if (!currentViewId || !sorts.length) return;

      return Promise.all(
        sorts.map((sort) =>
          updateViewSortMutation({
            variables: {
              data: {
                direction: sort.order as ViewSortDirection,
              },
              where: {
                viewId_key: { key: sort.key, viewId: currentViewId },
              },
            },
            refetchQueries: [getOperationName(GET_VIEW_SORTS) ?? ''],
          }),
        ),
      );
    },
    [currentViewId, updateViewSortMutation],
  );

  const deleteViewSorts = useCallback(
    (sortKeys: string[]) => {
      if (!currentViewId || !sortKeys.length) return;

      return deleteViewSortsMutation({
        variables: {
          where: {
            key: { in: sortKeys },
            viewId: { equals: currentViewId },
          },
        },
        refetchQueries: [getOperationName(GET_VIEW_SORTS) ?? ''],
      });
    },
    [currentViewId, deleteViewSortsMutation],
  );

  const updateSorts = useCallback(
    async (nextSorts: SelectedSortType<SortField>[]) => {
      if (!currentViewId) return;

      const sortsToCreate = nextSorts.filter(
        (nextSort) => !sortsByKey[nextSort.key],
      );
      await createViewSorts(sortsToCreate);

      const sortsToUpdate = nextSorts.filter(
        (nextSort) =>
          sortsByKey[nextSort.key] &&
          sortsByKey[nextSort.key].order !== nextSort.order,
      );
      await updateViewSorts(sortsToUpdate);

      const nextSortKeys = nextSorts.map((nextSort) => nextSort.key);
      const sortKeysToDelete = Object.keys(sortsByKey).filter(
        (previousSortKey) => !nextSortKeys.includes(previousSortKey),
      );
      return deleteViewSorts(sortKeysToDelete);
    },
    [
      createViewSorts,
      currentViewId,
      deleteViewSorts,
      sortsByKey,
      updateViewSorts,
    ],
  );

  return { updateSorts };
};
