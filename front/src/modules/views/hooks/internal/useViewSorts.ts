import { useCallback } from 'react';

import { Sort } from '@/ui/data/view-bar/types/Sort';
import {
  useCreateViewSortsMutation,
  useDeleteViewSortsMutation,
  useGetViewSortsQuery,
  useUpdateViewSortMutation,
  ViewSortDirection,
} from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { useViewStates } from '../useViewStates';

export const useViewSorts = (viewScopeId: string) => {
  const {
    currentViewId,
    availableViewSorts,
    currentViewSorts,
    setCurrentViewSorts,
    setSavedViewSorts,
    savedViewSortsByKey,
  } = useViewStates(viewScopeId);

  const { refetch } = useGetViewSortsQuery({
    skip: !currentViewId,
    variables: {
      where: {
        viewId: { equals: currentViewId },
      },
    },
    onCompleted: (data) => {
      if (!availableViewSorts) return;

      const nextSorts = data.viewSorts
        .map((viewSort) => {
          const foundCorrespondingSortDefinition = availableViewSorts.find(
            (sort) => sort.key === viewSort.key,
          );

          if (foundCorrespondingSortDefinition) {
            return {
              key: viewSort.key,
              definition: foundCorrespondingSortDefinition,
              direction: viewSort.direction.toLowerCase(),
            } as Sort;
          } else {
            return undefined;
          }
        })
        .filter((sort): sort is Sort => !!sort);

      if (!isDeeplyEqual(currentViewSorts, nextSorts)) {
        setSavedViewSorts?.(nextSorts);
        setCurrentViewSorts?.(nextSorts);
      }
    },
  });

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

  const persistViewSorts = useCallback(async () => {
    if (!currentViewId) {
      return;
    }
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

    return refetch();
  }, [
    currentViewId,
    currentViewSorts,
    savedViewSortsByKey,
    _createViewSorts,
    _updateViewSorts,
    _deleteViewSorts,
    refetch,
  ]);

  return { persistViewSorts };
};
