import { useCallback } from 'react';

import { Filter } from '@/views/components/view-bar/types/Filter';
import {
  useCreateViewFiltersMutation,
  useDeleteViewFiltersMutation,
  useGetViewFiltersQuery,
  useUpdateViewFilterMutation,
} from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useViewStates } from '../useViewStates';

export const useViewFilters = (viewScopeId: string) => {
  const {
    currentViewId,
    currentViewFilters,
    setCurrentViewFilters,
    availableFilters,
    savedViewFiltersByKey,
    setSavedViewFilters,
  } = useViewStates(viewScopeId);

  const { refetch } = useGetViewFiltersQuery({
    skip: !currentViewId,
    variables: {
      where: {
        viewId: { equals: currentViewId },
      },
    },
    onCompleted: (data) => {
      if (!availableFilters) {
        return;
      }

      const queriedViewFilters = data.viewFilters
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

      if (!isDeeplyEqual(currentViewFilters, queriedViewFilters)) {
        setSavedViewFilters?.(queriedViewFilters);
        setCurrentViewFilters?.(queriedViewFilters);
      }
    },
  });

  const [createViewFiltersMutation] = useCreateViewFiltersMutation();
  const [updateViewFilterMutation] = useUpdateViewFilterMutation();
  const [deleteViewFiltersMutation] = useDeleteViewFiltersMutation();

  const _createViewFilters = useCallback(
    (filters: Filter[], viewId = currentViewId) => {
      if (!viewId || !filters.length) {
        return;
      }

      if (!availableFilters) {
        return;
      }

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

  const _updateViewFilters = useCallback(
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

  const _deleteViewFilters = useCallback(
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

  const persistViewFilters = useCallback(async () => {
    if (!currentViewId) {
      return;
    }
    if (!currentViewFilters) {
      return;
    }
    if (!savedViewFiltersByKey) {
      return;
    }

    const filtersToCreate = currentViewFilters.filter(
      (filter) => !savedViewFiltersByKey[filter.key],
    );
    await _createViewFilters(filtersToCreate);

    const filtersToUpdate = currentViewFilters.filter(
      (filter) =>
        savedViewFiltersByKey[filter.key] &&
        (savedViewFiltersByKey[filter.key].operand !== filter.operand ||
          savedViewFiltersByKey[filter.key].value !== filter.value),
    );
    await _updateViewFilters(filtersToUpdate);

    const filterKeys = currentViewFilters.map((filter) => filter.key);
    const filterKeysToDelete = Object.keys(savedViewFiltersByKey).filter(
      (previousFilterKey) => !filterKeys.includes(previousFilterKey),
    );
    await _deleteViewFilters(filterKeysToDelete);

    return refetch();
  }, [
    currentViewId,
    currentViewFilters,
    savedViewFiltersByKey,
    _createViewFilters,
    _updateViewFilters,
    _deleteViewFilters,
    refetch,
  ]);

  return { persistViewFilters };
};
