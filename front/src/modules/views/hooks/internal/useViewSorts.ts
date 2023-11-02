import { useApolloClient } from '@apollo/client';
import { produce } from 'immer';
import { useRecoilCallback } from 'recoil';

import { useFindOneObjectMetadataItem } from '@/metadata/hooks/useFindOneObjectMetadataItem';
import { Sort } from '@/ui/object/object-sort-dropdown/types/Sort';
import { currentViewIdScopedState } from '@/views/states/currentViewIdScopedState';
import { currentViewSortsScopedFamilyState } from '@/views/states/currentViewSortsScopedFamilyState';
import { onViewSortsChangeScopedState } from '@/views/states/onViewSortsChangeScopedState';
import { savedViewSortsScopedFamilyState } from '@/views/states/savedViewSortsScopedFamilyState';
import { savedViewSortsByKeyScopedFamilySelector } from '@/views/states/selectors/savedViewSortsByKeyScopedFamilySelector';
import { ViewSort } from '@/views/types/ViewSort';

import { useViewSetStates } from '../useViewSetStates';

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
  const { setCurrentViewSorts } = useViewSetStates(viewScopeId);

  const persistViewSorts = useRecoilCallback(
    ({ snapshot, set }) =>
      async (viewId?: string) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdScopedState({ scopeId: viewScopeId }))
          .getValue();
        if (!currentViewId) {
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
            viewSortIdsToDelete.map((viewFilterId) =>
              apolloClient.mutate({
                mutation: deleteOneMutation,
                variables: {
                  idToDelete: viewFilterId,
                },
              }),
            ),
          );
        };

        const currentViewSorts = snapshot
          .getLoadable(
            currentViewSortsScopedFamilyState({
              scopeId: viewScopeId,
              familyKey: currentViewId,
            }),
          )
          .getValue();

        const savedViewSortsByKey = snapshot
          .getLoadable(
            savedViewSortsByKeyScopedFamilySelector({
              scopeId: viewScopeId,
              viewId: viewId ?? currentViewId,
            }),
          )
          .getValue();

        if (!currentViewSorts) {
          return;
        }
        if (!savedViewSortsByKey) {
          return;
        }

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
    ({ snapshot }) =>
      (sortToUpsert: Sort) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdScopedState({ scopeId: viewScopeId }))
          .getValue();

        if (!currentViewId) {
          return;
        }

        const savedViewSortsByKey = snapshot
          .getLoadable(
            savedViewSortsByKeyScopedFamilySelector({
              scopeId: viewScopeId,
              viewId: currentViewId,
            }),
          )
          .getValue();

        if (!savedViewSortsByKey) {
          return;
        }

        const onViewSortsChange = snapshot
          .getLoadable(onViewSortsChangeScopedState({ scopeId: viewScopeId }))
          .getValue();

        const existingSavedSortId =
          savedViewSortsByKey[sortToUpsert.fieldId]?.id;

        setCurrentViewSorts?.((sorts) => {
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
  );

  const removeViewSort = useRecoilCallback(
    ({ snapshot }) =>
      (fieldId: string) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdScopedState({ scopeId: viewScopeId }))
          .getValue();

        if (!currentViewId) {
          return;
        }

        const onViewSortsChange = snapshot
          .getLoadable(onViewSortsChangeScopedState({ scopeId: viewScopeId }))
          .getValue();

        const currentViewSorts = snapshot
          .getLoadable(
            currentViewSortsScopedFamilyState({
              scopeId: viewScopeId,
              familyKey: currentViewId,
            }),
          )
          .getValue();

        const newViewSorts = currentViewSorts.filter((filter) => {
          return filter.fieldId !== fieldId;
        });
        setCurrentViewSorts?.(newViewSorts);
        onViewSortsChange?.(newViewSorts);
      },
  );

  return { persistViewSorts, upsertViewSort, removeViewSort };
};
