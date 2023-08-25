import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { savedSortsScopedState } from '@/ui/filter-n-sort/states/savedSortsScopedState';
import { savedSortsByKeyScopedSelector } from '@/ui/filter-n-sort/states/selectors/savedSortsByKeyScopedSelector';
import { sortsScopedState } from '@/ui/filter-n-sort/states/sortsScopedState';
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
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useViewSorts = <SortField>({
  availableSorts,
}: {
  availableSorts: SortType<SortField>[];
}) => {
  const currentViewId = useRecoilScopedValue(
    currentTableViewIdState,
    TableRecoilScopeContext,
  );
  const [sorts, setSorts] = useRecoilScopedState(
    sortsScopedState,
    TableRecoilScopeContext,
  );
  const [, setSavedSorts] = useRecoilState(
    savedSortsScopedState(currentViewId),
  );
  const savedSortsByKey = useRecoilValue(
    savedSortsByKeyScopedSelector(currentViewId),
  );

  const { refetch } = useGetViewSortsQuery({
    skip: !currentViewId,
    variables: {
      where: {
        viewId: { equals: currentViewId },
      },
    },
    onCompleted: (data) => {
      const nextSorts = data.viewSorts
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
        .filter((sort): sort is SelectedSortType<SortField> => !!sort);

      if (!isDeeplyEqual(sorts, nextSorts)) {
        setSavedSorts(nextSorts);
        setSorts(nextSorts);
      }
    },
  });

  const [createViewSortsMutation] = useCreateViewSortsMutation();
  const [updateViewSortMutation] = useUpdateViewSortMutation();
  const [deleteViewSortsMutation] = useDeleteViewSortsMutation();

  const createViewSorts = useCallback(
    (sorts: SelectedSortType<SortField>[], viewId = currentViewId) => {
      if (!viewId || !sorts.length) return;

      return createViewSortsMutation({
        variables: {
          data: sorts.map((sort) => ({
            key: sort.key,
            direction: sort.order as ViewSortDirection,
            name: sort.label,
            viewId,
          })),
        },
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
      });
    },
    [currentViewId, deleteViewSortsMutation],
  );

  const persistSorts = useCallback(async () => {
    if (!currentViewId) return;

    const sortsToCreate = sorts.filter((sort) => !savedSortsByKey[sort.key]);
    await createViewSorts(sortsToCreate);

    const sortsToUpdate = sorts.filter(
      (sort) =>
        savedSortsByKey[sort.key] &&
        savedSortsByKey[sort.key].order !== sort.order,
    );
    await updateViewSorts(sortsToUpdate);

    const sortKeys = sorts.map((sort) => sort.key);
    const sortKeysToDelete = Object.keys(savedSortsByKey).filter(
      (previousSortKey) => !sortKeys.includes(previousSortKey),
    );
    await deleteViewSorts(sortKeysToDelete);

    return refetch();
  }, [
    currentViewId,
    sorts,
    createViewSorts,
    updateViewSorts,
    savedSortsByKey,
    deleteViewSorts,
    refetch,
  ]);

  return { createViewSorts, persistSorts };
};
