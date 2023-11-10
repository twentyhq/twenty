import { useApolloClient } from '@apollo/client';
import { produce } from 'immer';
import { useRecoilCallback } from 'recoil';

import { useFindOneObjectMetadataItem } from '@/metadata/hooks/useFindOneObjectMetadataItem';
import { Sort } from '@/ui/object/object-sort-dropdown/types/Sort';
import { savedViewSortsScopedFamilyState } from '@/views/states/savedViewSortsScopedFamilyState';
import { ViewSort } from '@/views/types/ViewSort';
import { getViewScopedStateValuesFromSnapshot } from '@/views/utils/getViewScopedStateValuesFromSnapshot';

import { useViewScopedStates } from './useViewScopedStates';

export const useViewSorts = (viewScopeId: string) => {
  const {
    updateOneMutation,
    createOneMutation,
    deleteOneMutation,
    findManyQuery,
  } = useFindOneObjectMetadataItem({
    objectNameSingular: 'viewSortV2',
  });
  const apolloClient = useApolloClient();

  const { currentViewSortsState } = useViewScopedStates({
    customViewScopeId: viewScopeId,
  });

  const persistViewSorts = useRecoilCallback(
    ({ snapshot, set }) =>
      async (viewId?: string) => {
        const { currentViewId, currentViewSorts, savedViewSortsByKey } =
          getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId,
          });

        if (!currentViewId) {
          return;
        }

        if (!currentViewSorts) {
          return;
        }
        if (!savedViewSortsByKey) {
          return;
        }

        const createViewSorts = (viewSortsToCreate: ViewSort[]) => {
          if (!viewSortsToCreate.length) return;

          return Promise.all(
            viewSortsToCreate.map((viewSort) =>
              apolloClient.mutate({
                mutation: createOneMutation,
                variables: {
                  input: {
                    fieldId: viewSort.fieldId,
                    viewId: viewId ?? currentViewId,
                    direction: viewSort.direction,
                  },
                },
                refetchQueries: [findManyQuery],
              }),
            ),
          );
        };

        const updateViewSorts = (viewSortsToUpdate: ViewSort[]) => {
          if (!viewSortsToUpdate.length) return;

          return Promise.all(
            viewSortsToUpdate.map((viewSort) =>
              apolloClient.mutate({
                mutation: updateOneMutation,
                variables: {
                  idToUpdate: viewSort.id,
                  input: {
                    direction: viewSort.direction,
                  },
                },
              }),
            ),
          );
        };

        const deleteViewSorts = (viewSortIdsToDelete: string[]) => {
          if (!viewSortIdsToDelete.length) return;

          return Promise.all(
            viewSortIdsToDelete.map((viewSortId) =>
              apolloClient.mutate({
                mutation: deleteOneMutation,
                variables: {
                  idToDelete: viewSortId,
                },
              }),
            ),
          );
        };

        const sortsToCreate = currentViewSorts.filter(
          (sort) => !savedViewSortsByKey[sort.fieldId],
        );

        await createViewSorts(sortsToCreate);

        const sortsToUpdate = currentViewSorts.filter(
          (sort) =>
            savedViewSortsByKey[sort.fieldId] &&
            savedViewSortsByKey[sort.fieldId].direction !== sort.direction,
        );
        await updateViewSorts(sortsToUpdate);

        const sortKeys = currentViewSorts.map((sort) => sort.fieldId);
        const sortKeysToDelete = Object.keys(savedViewSortsByKey).filter(
          (previousSortKey) => !sortKeys.includes(previousSortKey),
        );
        const sortIdsToDelete = sortKeysToDelete.map(
          (sortKeyToDelete) => savedViewSortsByKey[sortKeyToDelete].id ?? '',
        );
        await deleteViewSorts(sortIdsToDelete);
        set(
          savedViewSortsScopedFamilyState({
            scopeId: viewScopeId,
            familyKey: viewId ?? currentViewId,
          }),
          currentViewSorts,
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

  const upsertViewSort = useRecoilCallback(
    ({ snapshot, set }) =>
      (sortToUpsert: Sort) => {
        const { currentViewId, onViewSortsChange, savedViewSortsByKey } =
          getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId,
          });

        if (!currentViewId) {
          return;
        }

        if (!savedViewSortsByKey) {
          return;
        }

        const existingSavedSortId =
          savedViewSortsByKey[sortToUpsert.fieldId]?.id;

        set(currentViewSortsState, (sorts) => {
          const newViewSorts = produce(sorts, (sortsDraft) => {
            const existingSortIndex = sortsDraft.findIndex(
              (sort) => sort.fieldId === sortToUpsert.fieldId,
            );

            if (existingSortIndex === -1) {
              sortsDraft.push({ ...sortToUpsert, id: existingSavedSortId });
              return sortsDraft;
            }

            sortsDraft[existingSortIndex] = {
              ...sortToUpsert,
              id: existingSavedSortId,
            };
          });
          onViewSortsChange?.(newViewSorts);
          return newViewSorts;
        });
      },
    [currentViewSortsState, viewScopeId],
  );

  const removeViewSort = useRecoilCallback(
    ({ snapshot, set }) =>
      (fieldId: string) => {
        const { currentViewId, onViewSortsChange, currentViewSorts } =
          getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId,
          });

        if (!currentViewId) {
          return;
        }

        const newViewSorts = currentViewSorts.filter((filter) => {
          return filter.fieldId !== fieldId;
        });
        set(currentViewSortsState, newViewSorts);
        onViewSortsChange?.(newViewSorts);
      },
    [currentViewSortsState, viewScopeId],
  );

  return { persistViewSorts, upsertViewSort, removeViewSort };
};
