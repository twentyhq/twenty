import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { savedFiltersByKeyScopedState } from '@/ui/filter-n-sort/states/savedFiltersByKeyScopedState';
import { savedFiltersScopedState } from '@/ui/filter-n-sort/states/savedFiltersScopedState';
import type { Filter } from '@/ui/filter-n-sort/types/Filter';
import type { FilterDefinitionByEntity } from '@/ui/filter-n-sort/types/FilterDefinitionByEntity';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { currentTableViewIdState } from '@/ui/table/states/tableViewsState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import {
  useCreateViewFiltersMutation,
  useDeleteViewFiltersMutation,
  useGetViewFiltersQuery,
  useUpdateViewFilterMutation,
} from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useViewFilters = <Entity>({
  availableFilters,
}: {
  availableFilters: FilterDefinitionByEntity<Entity>[];
}) => {
  const currentViewId = useRecoilScopedValue(
    currentTableViewIdState,
    TableRecoilScopeContext,
  );
  const [filters, setFilters] = useRecoilScopedState(
    filtersScopedState,
    TableRecoilScopeContext,
  );
  const [, setSavedFilters] = useRecoilState(
    savedFiltersScopedState(currentViewId),
  );
  const savedFiltersByKey = useRecoilValue(
    savedFiltersByKeyScopedState(currentViewId),
  );

  const { refetch } = useGetViewFiltersQuery({
    skip: !currentViewId,
    variables: {
      where: {
        viewId: { equals: currentViewId },
      },
    },
    onCompleted: (data) => {
      const nextFilters = data.viewFilters
        .map((viewFilter) => {
          const availableFilter = availableFilters.find(
            (filter) => filter.field === viewFilter.key,
          );

          return availableFilter
            ? ({
                displayValue: viewFilter.displayValue ?? viewFilter.value,
                field: viewFilter.key,
                operand: viewFilter.operand,
                type: availableFilter.type,
                value: viewFilter.value,
              } as Filter)
            : undefined;
        })
        .filter((filter): filter is Filter => !!filter);

      if (!isDeeplyEqual(filters, nextFilters)) {
        setSavedFilters(nextFilters);
        setFilters(nextFilters);
      }
    },
  });

  const [createViewFiltersMutation] = useCreateViewFiltersMutation();
  const [updateViewFilterMutation] = useUpdateViewFilterMutation();
  const [deleteViewFiltersMutation] = useDeleteViewFiltersMutation();

  const createViewFilters = useCallback(
    (filters: Filter[]) => {
      if (!currentViewId || !filters.length) return;

      return createViewFiltersMutation({
        variables: {
          data: filters.map((filter) => ({
            displayValue: filter.displayValue ?? filter.value,
            key: filter.field,
            name:
              availableFilters.find(({ field }) => field === filter.field)
                ?.label ?? '',
            operand: filter.operand,
            value: filter.value,
            viewId: currentViewId,
          })),
        },
      });
    },
    [availableFilters, createViewFiltersMutation, currentViewId],
  );

  const updateViewFilters = useCallback(
    (filters: Filter[]) => {
      if (!currentViewId || !filters.length) return;

      return Promise.all(
        filters.map((filter) =>
          updateViewFilterMutation({
            variables: {
              data: {
                displayValue: filter.displayValue ?? filter.value,
                operand: filter.operand,
                value: filter.value,
              },
              where: {
                viewId_key: { key: filter.field, viewId: currentViewId },
              },
            },
          }),
        ),
      );
    },
    [currentViewId, updateViewFilterMutation],
  );

  const deleteViewFilters = useCallback(
    (filterKeys: string[]) => {
      if (!currentViewId || !filterKeys.length) return;

      return deleteViewFiltersMutation({
        variables: {
          where: {
            key: { in: filterKeys },
            viewId: { equals: currentViewId },
          },
        },
      });
    },
    [currentViewId, deleteViewFiltersMutation],
  );

  const persistFilters = useCallback(async () => {
    if (!currentViewId) return;

    const filtersToCreate = filters.filter(
      (filter) => !savedFiltersByKey[filter.field],
    );
    await createViewFilters(filtersToCreate);

    const filtersToUpdate = filters.filter(
      (filter) =>
        savedFiltersByKey[filter.field] &&
        (savedFiltersByKey[filter.field].operand !== filter.operand ||
          savedFiltersByKey[filter.field].value !== filter.value),
    );
    await updateViewFilters(filtersToUpdate);

    const filterKeys = filters.map((filter) => filter.field);
    const filterKeysToDelete = Object.keys(savedFiltersByKey).filter(
      (previousFilterKey) => !filterKeys.includes(previousFilterKey),
    );
    await deleteViewFilters(filterKeysToDelete);

    return refetch();
  }, [
    currentViewId,
    filters,
    createViewFilters,
    updateViewFilters,
    savedFiltersByKey,
    deleteViewFilters,
    refetch,
  ]);

  return { persistFilters };
};
