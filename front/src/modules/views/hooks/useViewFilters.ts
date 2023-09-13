import { Context, useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { availableFiltersScopedState } from '@/ui/view-bar/states/availableFiltersScopedState';
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';
import { filtersScopedState } from '@/ui/view-bar/states/filtersScopedState';
import { savedFiltersFamilyState } from '@/ui/view-bar/states/savedFiltersFamilyState';
import { savedFiltersByKeyFamilySelector } from '@/ui/view-bar/states/selectors/savedFiltersByKeyFamilySelector';
import type { Filter } from '@/ui/view-bar/types/Filter';
import {
  useCreateViewFiltersMutation,
  useDeleteViewFiltersMutation,
  useGetViewFiltersQuery,
  useUpdateViewFilterMutation,
} from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useViewFilters = ({
  scopeContext,
  skipFetch,
}: {
  scopeContext: Context<string | null>;
  skipFetch?: boolean;
}) => {
  const currentViewId = useRecoilScopedValue(
    currentViewIdScopedState,
    scopeContext,
  );
  const [filters, setFilters] = useRecoilScopedState(
    filtersScopedState,
    scopeContext,
  );
  const [availableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    scopeContext,
  );
  const [, setSavedFilters] = useRecoilState(
    savedFiltersFamilyState(currentViewId),
  );
  const savedFiltersByKey = useRecoilValue(
    savedFiltersByKeyFamilySelector(currentViewId),
  );

  const { refetch } = useGetViewFiltersQuery({
    skip: !currentViewId || skipFetch,
    variables: {
      where: {
        viewId: { equals: currentViewId },
      },
    },
    onCompleted: (data) => {
      const nextFilters = data.viewFilters
        .map(({ __typename, name: _name, ...viewFilter }) => {
          const availableFilter = availableFilters.find(
            (filter) => filter.key === viewFilter.key,
          );

          return availableFilter
            ? {
                ...viewFilter,
                displayValue: viewFilter.displayValue ?? viewFilter.value,
                type: availableFilter.type,
              }
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
    (filters: Filter[], viewId = currentViewId) => {
      if (!viewId || !filters.length) return;

      return createViewFiltersMutation({
        variables: {
          data: filters.map((filter) => ({
            displayValue: filter.displayValue ?? filter.value,
            key: filter.key,
            name:
              availableFilters.find(({ key }) => key === filter.key)?.label ??
              '',
            operand: filter.operand,
            value: filter.value,
            viewId,
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
                viewId_key: { key: filter.key, viewId: currentViewId },
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
      (filter) => !savedFiltersByKey[filter.key],
    );
    await createViewFilters(filtersToCreate);

    const filtersToUpdate = filters.filter(
      (filter) =>
        savedFiltersByKey[filter.key] &&
        (savedFiltersByKey[filter.key].operand !== filter.operand ||
          savedFiltersByKey[filter.key].value !== filter.value),
    );
    await updateViewFilters(filtersToUpdate);

    const filterKeys = filters.map((filter) => filter.key);
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

  return { createViewFilters, persistFilters };
};
