import { useApolloClient } from '@apollo/client';
import { produce } from 'immer';
import { useRecoilCallback } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { savedViewFiltersScopedFamilyState } from '@/views/states/savedViewFiltersScopedFamilyState';
import { ViewFilter } from '@/views/types/ViewFilter';
import { getViewScopedStateValuesFromSnapshot } from '@/views/utils/getViewScopedStateValuesFromSnapshot';

import { useViewScopedStates } from './useViewScopedStates';

export const useViewFilters = (viewScopeId: string) => {
  const {
    updateOneRecordMutation,
    createOneRecordMutation,
    deleteOneRecordMutation,
  } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ViewFilter,
  });

  const { modifyRecordFromCache } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const apolloClient = useApolloClient();

  const { currentViewFiltersState } = useViewScopedStates({
    viewScopeId: viewScopeId,
  });

  const persistViewFilters = useRecoilCallback(
    ({ snapshot, set }) =>
      async (viewId?: string) => {
        const {
          currentViewId,
          currentViewFilters,
          savedViewFiltersByKey,
          views,
        } = getViewScopedStateValuesFromSnapshot({
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
                mutation: createOneRecordMutation,
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
                mutation: updateOneRecordMutation,
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
                mutation: deleteOneRecordMutation,
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

        const existingViewId = viewId ?? currentViewId;
        const existingView = views.find((view) => view.id === existingViewId);

        if (!existingView) {
          return;
        }

        modifyRecordFromCache(existingViewId, {
          viewFilters: () => ({
            edges: currentViewFilters.map((viewFilter) => ({
              node: viewFilter,
              cursor: '',
            })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '',
              endCursor: '',
            },
          }),
        });
      },
    [
      apolloClient,
      createOneRecordMutation,
      deleteOneRecordMutation,
      modifyRecordFromCache,
      updateOneRecordMutation,
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
