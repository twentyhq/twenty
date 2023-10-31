import { useApolloClient } from '@apollo/client';
import { produce } from 'immer';
import { useRecoilCallback } from 'recoil';

import { useFindOneObjectMetadataItem } from '@/metadata/hooks/useFindOneObjectMetadataItem';
import { Filter } from '@/ui/object/object-filter-dropdown/types/Filter';
import { currentViewFiltersScopedFamilyState } from '@/views/states/currentViewFiltersScopedFamilyState';
import { currentViewIdScopedState } from '@/views/states/currentViewIdScopedState';
import { onViewFiltersChangeScopedState } from '@/views/states/onViewFiltersChangeScopedState';
import { savedViewFiltersScopedFamilyState } from '@/views/states/savedViewFiltersScopedFamilyState';
import { savedViewFiltersByKeyScopedFamilySelector } from '@/views/states/selectors/savedViewFiltersByKeyScopedFamilySelector';
import { ViewFilter } from '@/views/types/ViewFilter';

import { useViewSetStates } from '../useViewSetStates';

export const useViewFilters = (viewScopeId: string) => {
  const {
    updateOneMutation,
    createOneMutation,
    deleteOneMutation,
    findManyQuery,
  } = useFindOneObjectMetadataItem({
    objectNameSingular: 'viewFilterV2',
  });
  const apolloClient = useApolloClient();
  const { setCurrentViewFilters } = useViewSetStates(viewScopeId);

  const persistViewFilters = useRecoilCallback(
    ({ snapshot, set }) =>
      async (viewId?: string) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdScopedState({ scopeId: viewScopeId }))
          .getValue();
        if (!currentViewId) {
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
              viewId: viewId ?? currentViewId,
            }),
          )
          .getValue();

        if (!currentViewFilters) {
          return;
        }
        if (!savedViewFiltersByKey) {
          return;
        }

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
      findManyQuery,
      updateOneMutation,
      viewScopeId,
    ],
  );

  const upsertViewFilter = useRecoilCallback(
    ({ snapshot }) =>
      (filterToUpsert: Filter) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdScopedState({ scopeId: viewScopeId }))
          .getValue();

        if (!currentViewId) {
          return;
        }

        const savedViewFiltersByKey = snapshot
          .getLoadable(
            savedViewFiltersByKeyScopedFamilySelector({
              scopeId: viewScopeId,
              viewId: currentViewId,
            }),
          )
          .getValue();

        if (!savedViewFiltersByKey) {
          return;
        }

        const onViewFiltersChange = snapshot
          .getLoadable(onViewFiltersChangeScopedState({ scopeId: viewScopeId }))
          .getValue();

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
  );

  const removeViewFilter = useRecoilCallback(
    ({ snapshot }) =>
      (fieldId: string) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdScopedState({ scopeId: viewScopeId }))
          .getValue();

        if (!currentViewId) {
          return;
        }

        const onViewFiltersChange = snapshot
          .getLoadable(onViewFiltersChangeScopedState({ scopeId: viewScopeId }))
          .getValue();

        const currentViewFilters = snapshot
          .getLoadable(
            currentViewFiltersScopedFamilyState({
              scopeId: viewScopeId,
              familyKey: currentViewId,
            }),
          )
          .getValue();

        const newViewFilters = currentViewFilters.filter((filter) => {
          return filter.fieldId !== fieldId;
        });
        setCurrentViewFilters?.(newViewFilters);
        onViewFiltersChange?.(newViewFilters);
      },
  );

  return { persistViewFilters, removeViewFilter, upsertViewFilter };
};
