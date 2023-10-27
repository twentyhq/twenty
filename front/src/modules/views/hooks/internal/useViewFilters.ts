import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';

import { Filter } from '@/ui/data/filter/types/Filter';
import { FilterDefinition } from '@/ui/data/filter/types/FilterDefinition';
import { availableFiltersScopedState } from '@/views/states/availableFiltersScopedState';
import { currentViewFiltersScopedFamilyState } from '@/views/states/currentViewFiltersScopedFamilyState';
import { savedViewFiltersByKeyScopedFamilySelector } from '@/views/states/selectors/savedViewFiltersByKeyScopedFamilySelector';
import {
  useCreateViewFiltersMutation,
  useDeleteViewFiltersMutation,
  useUpdateViewFilterMutation,
} from '~/generated/graphql';

import { useViewStates } from '../useViewStates';

export const useViewFilters = (viewScopeId: string) => {
  const { currentViewId } = useViewStates(viewScopeId);

  const [createViewFiltersMutation] = useCreateViewFiltersMutation();
  const [updateViewFilterMutation] = useUpdateViewFilterMutation();
  const [deleteViewFiltersMutation] = useDeleteViewFiltersMutation();

  const _createViewFilters = useCallback(
    (
      filters: Filter[],
      availableFilters: FilterDefinition[] = [],
      viewId = currentViewId,
    ) => {
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
    [createViewFiltersMutation, currentViewId],
  );

  const _updateViewFilters = useCallback(
    (filters: Filter[], viewId = currentViewId) => {
      if (!viewId || !filters.length) return;

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
                viewId_key: { key: filter.key, viewId: viewId },
              },
            },
          }),
        ),
      );
    },
    [currentViewId, updateViewFilterMutation],
  );

  const _deleteViewFilters = useCallback(
    (filterKeys: string[], viewId = currentViewId) => {
      if (!viewId || !filterKeys.length) return;

      return deleteViewFiltersMutation({
        variables: {
          where: {
            key: { in: filterKeys },
            viewId: { equals: viewId },
          },
        },
      });
    },
    [currentViewId, deleteViewFiltersMutation],
  );

  const persistViewFilters = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        if (!currentViewId) {
          return;
        }

        const currentViewFilters = snapshot
          .getLoadable(
            currentViewFiltersScopedFamilyState({
              scopeId: viewScopeId,
              familyKey: currentViewId,
            }),
          )
          .getValue();

        const savedViewFiltersByKey = snapshot
          .getLoadable(
            savedViewFiltersByKeyScopedFamilySelector({
              scopeId: viewScopeId,
              viewId: currentViewId,
            }),
          )
          .getValue();

        if (!currentViewFilters) {
          return;
        }
        if (!savedViewFiltersByKey) {
          return;
        }

        const availableFilters = snapshot
          .getLoadable(
            availableFiltersScopedState({
              scopeId: viewScopeId,
            }),
          )
          .getValue();

        const filtersToCreate = currentViewFilters.filter(
          (filter) => !savedViewFiltersByKey[filter.key],
        );
        await _createViewFilters(filtersToCreate, availableFilters);

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
      },
    [
      currentViewId,
      viewScopeId,
      _createViewFilters,
      _updateViewFilters,
      _deleteViewFilters,
    ],
  );

  return { persistViewFilters };
};
