import { useApolloClient } from '@apollo/client';
import { produce } from 'immer';
import { useRecoilCallback } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { savedViewSortsScopedFamilyState } from '@/views/states/savedViewSortsScopedFamilyState';
import { ViewSort } from '@/views/types/ViewSort';
import { getViewScopedStateValuesFromSnapshot } from '@/views/utils/getViewScopedStateValuesFromSnapshot';

import { useViewScopedStates } from './useViewScopedStates';

export const useViewSorts = (viewScopeId: string) => {
  const {
    updateOneRecordMutation,
    createOneRecordMutation,
    deleteOneRecordMutation,
  } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ViewSort,
  });

  const { modifyRecordFromCache } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.View,
  });
  const apolloClient = useApolloClient();

  const { currentViewSortsState } = useViewScopedStates({
    viewScopeId: viewScopeId,
  });

  const persistViewSorts = useRecoilCallback(
    ({ snapshot, set }) =>
      async (viewId?: string) => {
        const { currentViewId, currentViewSorts, savedViewSortsByKey, views } =
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
                mutation: createOneRecordMutation,
                variables: {
                  input: {
                    fieldMetadataId: viewSort.fieldMetadataId,
                    viewId: viewId ?? currentViewId,
                    direction: viewSort.direction,
                  },
                },
              }),
            ),
          );
        };

        const updateViewSorts = (viewSortsToUpdate: ViewSort[]) => {
          if (!viewSortsToUpdate.length) return;

          return Promise.all(
            viewSortsToUpdate.map((viewSort) =>
              apolloClient.mutate({
                mutation: updateOneRecordMutation,
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
                mutation: deleteOneRecordMutation,
                variables: {
                  idToDelete: viewSortId,
                },
              }),
            ),
          );
        };

        const sortsToCreate = currentViewSorts.filter(
          (sort) => !savedViewSortsByKey[sort.fieldMetadataId],
        );

        await createViewSorts(sortsToCreate);

        const sortsToUpdate = currentViewSorts.filter(
          (sort) =>
            savedViewSortsByKey[sort.fieldMetadataId] &&
            savedViewSortsByKey[sort.fieldMetadataId].direction !==
              sort.direction,
        );
        await updateViewSorts(sortsToUpdate);

        const sortKeys = currentViewSorts.map((sort) => sort.fieldMetadataId);
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
        const existingViewId = viewId ?? currentViewId;
        const existingView = views.find((view) => view.id === existingViewId);

        if (!existingView) {
          return;
        }

        modifyRecordFromCache(existingViewId, {
          viewSorts: () => ({
            edges: currentViewSorts.map((viewSort) => ({
              node: viewSort,
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
          savedViewSortsByKey[sortToUpsert.fieldMetadataId]?.id;

        set(currentViewSortsState, (sorts) => {
          const newViewSorts = produce(sorts, (sortsDraft) => {
            const existingSortIndex = sortsDraft.findIndex(
              (sort) => sort.fieldMetadataId === sortToUpsert.fieldMetadataId,
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
      (fieldMetadataId: string) => {
        const { currentViewId, onViewSortsChange, currentViewSorts } =
          getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId,
          });

        if (!currentViewId) {
          return;
        }

        const newViewSorts = currentViewSorts.filter((filter) => {
          return filter.fieldMetadataId !== fieldMetadataId;
        });
        set(currentViewSortsState, newViewSorts);
        onViewSortsChange?.(newViewSorts);
      },
    [currentViewSortsState, viewScopeId],
  );

  return { persistViewSorts, upsertViewSort, removeViewSort };
};
