import { useRecoilCallback } from 'recoil';

import { Filter } from '@/ui/data/filter/types/Filter';
import { FilterDefinition } from '@/ui/data/filter/types/FilterDefinition';
import { availableFilterDefinitionsScopedState } from '@/views/states/availableFilterDefinitionsScopedState';
import { currentViewFiltersScopedFamilyState } from '@/views/states/currentViewFiltersScopedFamilyState';
import { currentViewIdScopedState } from '@/views/states/currentViewIdScopedState';
import { savedViewFiltersScopedFamilyState } from '@/views/states/savedViewFiltersScopedFamilyState';
import { savedViewFiltersByKeyScopedFamilySelector } from '@/views/states/selectors/savedViewFiltersByKeyScopedFamilySelector';

export const useViewFilters = (viewScopeId: string) => {
  const persistViewFilters = useRecoilCallback(
    ({ snapshot, set }) =>
      async (viewId?: string) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdScopedState({ scopeId: viewScopeId }))
          .getValue();
        if (!currentViewId) {
          return;
        }

        const _createViewFilters = (
          filters: Filter[],
          availableFilterDefinitions: FilterDefinition[] = [],
        ) => {
          if (!currentViewId || !filters.length) {
            return;
          }

          if (!availableFilterDefinitions) {
            return;
          }

          // return createViewFiltersMutation({
          //   variables: {
          //     data: filters.map((filter) => ({
          //       displayValue: filter.displayValue ?? filter.value,
          //       key: filter.key,
          //       name:
          //         availableFilterDefinitions.find(({ key }) => key === filter.key)
          //           ?.label ?? '',
          //       operand: filter.operand,
          //       value: filter.value,
          //       viewId: viewId ?? currentViewId,
          //     })),
          //   },
          // });
        };

        const _updateViewFilters = (filters: Filter[]) => {
          if (!currentViewId || !filters.length) return;

          // return Promise.all(
          //   filters.map((filter) =>
          //     updateViewFilterMutation({
          //       variables: {
          //         data: {
          //           displayValue: filter.displayValue ?? filter.value,
          //           operand: filter.operand,
          //           value: filter.value,
          //         },
          //         where: {
          //           viewId_key: {
          //             key: filter.key,
          //             viewId: viewId ?? currentViewId,
          //           },
          //         },
          //       },
          //     }),
          //   ),
          // );
        };

        const _deleteViewFilters = (filterKeys: string[]) => {
          if (!currentViewId || !filterKeys.length) return;

          // return deleteViewFiltersMutation({
          //   variables: {
          //     where: {
          //       key: { in: filterKeys },
          //       viewId: { equals: viewId ?? currentViewId },
          //     },
          //   },
          // });
        };

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

        const availableFilterDefinitions = snapshot
          .getLoadable(
            availableFilterDefinitionsScopedState({
              scopeId: viewScopeId,
            }),
          )
          .getValue();

        const filtersToCreate = currentViewFilters.filter(
          (filter) => !savedViewFiltersByKey[filter.fieldId],
        );
        await _createViewFilters(filtersToCreate, availableFilterDefinitions);

        const filtersToUpdate = currentViewFilters.filter(
          (filter) =>
            savedViewFiltersByKey[filter.fieldId] &&
            (savedViewFiltersByKey[filter.fieldId].operand !== filter.operand ||
              savedViewFiltersByKey[filter.fieldId].value !== filter.value),
        );
        await _updateViewFilters(filtersToUpdate);

        const filterKeys = currentViewFilters.map((filter) => filter.fieldId);
        const filterKeysToDelete = Object.keys(savedViewFiltersByKey).filter(
          (previousFilterKey) => !filterKeys.includes(previousFilterKey),
        );
        await _deleteViewFilters(filterKeysToDelete);
        set(
          savedViewFiltersScopedFamilyState({
            scopeId: viewScopeId,
            familyKey: viewId ?? currentViewId,
          }),
          currentViewFilters,
        );
      },
    [viewScopeId],
  );

  return { persistViewFilters };
};
