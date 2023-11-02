import { useApolloClient } from '@apollo/client';
import { produce } from 'immer';
import { useRecoilCallback } from 'recoil';

import { useFindOneObjectMetadataItem } from '@/metadata/hooks/useFindOneObjectMetadataItem';
import { Filter } from '@/ui/object/object-filter-dropdown/types/Filter';
import { savedViewFiltersScopedFamilyState } from '@/views/states/savedViewFiltersScopedFamilyState';
import { ViewFilter } from '@/views/types/ViewFilter';
import { getViewScopedStateValuesFromSnapshot } from '@/views/utils/getViewScopedStateValuesFromSnapshot';

import { useViewSetStates } from '../useViewSetStates';

export const useViewFilters = (viewScopeId: string) => {
  const { updateOneMutation, createOneMutation, findManyQuery } =
    useFindOneObjectMetadataItem({
      objectNameSingular: 'viewFilterV2',
    });

  const apolloClient = useApolloClient();

  const { setCurrentViewFilters } = useViewSetStates(viewScopeId);

  const persistViewFilters = useRecoilCallback(
    ({ snapshot, set }) =>
      async (viewId?: string) => {
        const { currentViewId, currentViewFilters, savedViewFiltersByKey } =
          getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId,
          });

        if (!currentViewId) {
          return;
        }
        if (!currentViewFilters) {
          return;
        }
        if (!savedViewFiltersByKey) {
          return;
        }

        const createViewFilters = (viewFiltersToCreate: ViewFilter[]) => {
          if (!viewFiltersToCreate.length) return;

          return Promise.all(
            viewFiltersToCreate.map((viewFilter) =>
              apolloClient.mutate({
                mutation: createOneMutation,
                variables: {
                  input: {
                    fieldId: viewFilter.fieldId,
                    viewId: viewId ?? currentViewId,
                    value: viewFilter.value,
                    displayValue: viewFilter.displayValue,
                    operand: viewFilter.operand,
                  },
                },
                refetchQueries: [findManyQuery],
              }),
            ),
          );
        };

        const updateViewFilters = (viewFiltersToUpdate: ViewFilter[]) => {
          if (!viewFiltersToUpdate.length) return;

          return Promise.all(
            viewFiltersToUpdate.map((viewFilter) =>
              apolloClient.mutate({
                mutation: updateOneMutation,
                variables: {
                  idToUpdate: viewFilter.id,
                  input: {
                    value: viewFilter.value,
                    displayValue: viewFilter.displayValue,
                    operand: viewFilter.operand,
                  },
                },
              }),
            ),
          );
        };

        const deleteViewFilters = (viewFilterIdsToDelete: string[]) => {
          if (!viewFilterIdsToDelete.length) return;

          // Todo
        };

        const filtersToCreate = currentViewFilters.filter(
          (filter) => !savedViewFiltersByKey[filter.fieldId],
        );
        await createViewFilters(filtersToCreate);

        const filtersToUpdate = currentViewFilters.filter(
          (filter) =>
            savedViewFiltersByKey[filter.fieldId] &&
            (savedViewFiltersByKey[filter.fieldId].operand !== filter.operand ||
              savedViewFiltersByKey[filter.fieldId].value !== filter.value),
        );
        await updateViewFilters(filtersToUpdate);

        const filterKeys = currentViewFilters.map((filter) => filter.fieldId);
        const filterKeysToDelete = Object.keys(savedViewFiltersByKey).filter(
          (previousFilterKey) => !filterKeys.includes(previousFilterKey),
        );
        await deleteViewFilters(filterKeysToDelete);
        set(
          savedViewFiltersScopedFamilyState({
            scopeId: viewScopeId,
            familyKey: viewId ?? currentViewId,
          }),
          currentViewFilters,
        );
      },
    [
      apolloClient,
      createOneMutation,
      findManyQuery,
      updateOneMutation,
      viewScopeId,
    ],
  );

  const upsertViewFilter = useRecoilCallback(
    ({ snapshot }) =>
      (filterToUpsert: Filter) => {
        const { currentViewId, savedViewFiltersByKey, onViewFiltersChange } =
          getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId,
          });

        if (!currentViewId) {
          return;
        }

        if (!savedViewFiltersByKey) {
          return;
        }

        const existingSavedFilterId =
          savedViewFiltersByKey[filterToUpsert.fieldId]?.id;

        setCurrentViewFilters?.((filters) => {
          const newViewFilters = produce(filters, (filtersDraft) => {
            const existingFilterIndex = filtersDraft.findIndex(
              (filter) => filter.fieldId === filterToUpsert.fieldId,
            );

            if (existingFilterIndex === -1) {
              filtersDraft.push({
                ...filterToUpsert,
                id: existingSavedFilterId,
              });
              return filtersDraft;
            }

            filtersDraft[existingFilterIndex] = {
              ...filterToUpsert,
              id: existingSavedFilterId,
            };
          });
          onViewFiltersChange?.(newViewFilters);
          return newViewFilters;
        });
      },
    [setCurrentViewFilters, viewScopeId],
  );

  const removeViewFilter = useRecoilCallback(
    ({ snapshot }) =>
      (fieldId: string) => {
        const { currentViewId, currentViewFilters, onViewFiltersChange } =
          getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId,
          });

        if (!currentViewId) {
          return;
        }

        const newViewFilters = currentViewFilters.filter((filter) => {
          return filter.fieldId !== fieldId;
        });
        setCurrentViewFilters?.(newViewFilters);
        onViewFiltersChange?.(newViewFilters);
      },
    [setCurrentViewFilters, viewScopeId],
  );

  return { persistViewFilters, removeViewFilter, upsertViewFilter };
};
