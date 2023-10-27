/* eslint-disable no-console */
import { useCallback } from 'react';
import { produce } from 'immer';
import { useRecoilCallback } from 'recoil';

import { Sort } from '@/ui/data/sort/types/Sort';
import { currentViewSortsScopedFamilyState } from '@/views/states/currentViewSortsScopedFamilyState';
import { savedViewSortsByKeyScopedFamilySelector } from '@/views/states/selectors/savedViewSortsByKeyScopedFamilySelector';
import {
  useCreateViewSortsMutation,
  useDeleteViewSortsMutation,
  useUpdateViewSortMutation,
  ViewSortDirection,
} from '~/generated/graphql';

import { useViewStates } from '../useViewStates';

export const useViewSorts = (viewScopeId: string) => {
  const { currentViewId, setCurrentViewSorts } = useViewStates(viewScopeId);

  const [createViewSortsMutation] = useCreateViewSortsMutation();
  const [updateViewSortMutation] = useUpdateViewSortMutation();
  const [deleteViewSortsMutation] = useDeleteViewSortsMutation();

  const _createViewSorts = useCallback(
    (sorts: Sort[], viewId = currentViewId) => {
      if (!viewId || !sorts.length) return;

      return createViewSortsMutation({
        variables: {
          data: sorts.map((sort) => ({
            key: sort.key,
            direction: sort.direction as ViewSortDirection,
            name: sort.definition.label,
            viewId,
          })),
        },
      });
    },
    [createViewSortsMutation, currentViewId],
  );

  const _updateViewSorts = useCallback(
    (sorts: Sort[]) => {
      if (!currentViewId || !sorts.length) return;

      return Promise.all(
        sorts.map((sort) =>
          updateViewSortMutation({
            variables: {
              data: {
                direction: sort.direction as ViewSortDirection,
              },
              where: {
                viewId_key: { key: sort.key, viewId: currentViewId },
              },
            },
          }),
        ),
      );
    },
    [currentViewId, updateViewSortMutation],
  );

  const _deleteViewSorts = useCallback(
    (sortKeys: string[]) => {
      if (!currentViewId || !sortKeys.length) return;

      return deleteViewSortsMutation({
        variables: {
          where: {
            key: { in: sortKeys },
            viewId: { equals: currentViewId },
          },
        },
      });
    },
    [currentViewId, deleteViewSortsMutation],
  );

  const persistViewSorts = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        if (!currentViewId) {
          return;
        }

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
              viewId: currentViewId,
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
          (sort) => !savedViewSortsByKey[sort.key],
        );
        await _createViewSorts(sortsToCreate);

        const sortsToUpdate = currentViewSorts.filter(
          (sort) =>
            savedViewSortsByKey[sort.key] &&
            savedViewSortsByKey[sort.key].direction !== sort.direction,
        );
        await _updateViewSorts(sortsToUpdate);

        const sortKeys = currentViewSorts.map((sort) => sort.key);
        const sortKeysToDelete = Object.keys(savedViewSortsByKey).filter(
          (previousSortKey) => !sortKeys.includes(previousSortKey),
        );
        await _deleteViewSorts(sortKeysToDelete);
      },
    [
      currentViewId,
      viewScopeId,
      _createViewSorts,
      _updateViewSorts,
      _deleteViewSorts,
    ],
  );

  const upsertViewSort = (sortToUpsert: Sort) => {
    setCurrentViewSorts?.((sorts) => {
      return produce(sorts, (sortsDraft) => {
        const index = sortsDraft.findIndex(
          (sort) => sort.key === sortToUpsert.key,
        );

        if (index === -1) {
          sortsDraft.push(sortToUpsert);
        } else {
          sortsDraft[index] = sortToUpsert;
        }
      });
    });
  };

  return { persistViewSorts, upsertViewSort };
};
