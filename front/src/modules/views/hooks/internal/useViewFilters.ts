import { useApolloClient } from '@apollo/client';
import { produce } from 'immer';
import { useRecoilCallback } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { Filter } from '@/ui/object/object-filter-dropdown/types/Filter';
import { savedViewFiltersScopedFamilyState } from '@/views/states/savedViewFiltersScopedFamilyState';
import { ViewFilter } from '@/views/types/ViewFilter';
import { getViewScopedStateValuesFromSnapshot } from '@/views/utils/getViewScopedStateValuesFromSnapshot';

import { useViewScopedStates } from './useViewScopedStates';

export const useViewFilters = (viewScopeId: string) => {
  const { updateOneMutation, createOneMutation, deleteOneMutation } =
    useObjectMetadataItem({
      objectNameSingular: 'viewFilter',
    });
  const apolloClient = useApolloClient();

  const { currentViewFiltersState } = useViewScopedStates({
    customViewScopeId: viewScopeId,
  });

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
                    fieldMetadataId: viewFilter.fieldMetadataId,
                    viewId: viewId ?? currentViewId,
                    value: viewFilter.value,
                    displayValue: viewFilter.displayValue,
                    operand: viewFilter.operand,
                  },
                },
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

          return Promise.all(
            viewFilterIdsToDelete.map((viewFilterId) =>
              apolloClient.mutate({
                mutation: deleteOneMutation,
                variables: {
                  idToDelete: viewFilterId,
                },
              }),
            ),
          );
        };

        const filtersToCreate = currentViewFilters.filter(
          (filter) => !savedViewFiltersByKey[filter.fieldMetadataId],
        );
        await createViewFilters(filtersToCreate);

        const filtersToUpdate = currentViewFilters.filter(
          (filter) =>
            savedViewFiltersByKey[filter.fieldMetadataId] &&
            (savedViewFiltersByKey[filter.fieldMetadataId].operand !==
              filter.operand ||
              savedViewFiltersByKey[filter.fieldMetadataId].value !==
                filter.value),
        );
        await updateViewFilters(filtersToUpdate);

        const filterKeys = currentViewFilters.map(
          (filter) => filter.fieldMetadataId,
        );
        const filterKeysToDelete = Object.keys(savedViewFiltersByKey).filter(
          (previousFilterKey) => !filterKeys.includes(previousFilterKey),
        );
        const filterIdsToDelete = filterKeysToDelete.map(
          (filterKeyToDelete) =>
            savedViewFiltersByKey[filterKeyToDelete].id ?? '',
        );
        await deleteViewFilters(filterIdsToDelete);
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
      deleteOneMutation,
      updateOneMutation,
      viewScopeId,
    ],
  );

  const upsertViewFilter = useRecoilCallback(
    ({ snapshot, set }) =>
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
          savedViewFiltersByKey[filterToUpsert.fieldMetadataId]?.id;

        set(currentViewFiltersState, (filters) => {
          const newViewFilters = produce(filters, (filtersDraft) => {
            const existingFilterIndex = filtersDraft.findIndex(
              (filter) =>
                filter.fieldMetadataId === filterToUpsert.fieldMetadataId,
            );

            if (existingFilterIndex === -1 && filterToUpsert.value !== '') {
              filtersDraft.push({
                ...filterToUpsert,
                id: existingSavedFilterId,
              });
              return filtersDraft;
            }

            if (filterToUpsert.value === '') {
              filtersDraft.splice(existingFilterIndex, 1);
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
    [currentViewFiltersState, viewScopeId],
  );

  const removeViewFilter = useRecoilCallback(
    ({ snapshot, set }) =>
      (fieldMetadataId: string) => {
        const { currentViewId, currentViewFilters, onViewFiltersChange } =
          getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId,
          });

        if (!currentViewId) {
          return;
        }

        const newViewFilters = currentViewFilters.filter((filter) => {
          return filter.fieldMetadataId !== fieldMetadataId;
        });
        set(currentViewFiltersState, newViewFilters);
        onViewFiltersChange?.(newViewFilters);
      },
    [currentViewFiltersState, viewScopeId],
  );

  return { persistViewFilters, removeViewFilter, upsertViewFilter };
};
