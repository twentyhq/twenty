import { Context, useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { availableSortsScopedState } from '@/ui/view-bar/states/availableSortsScopedState';
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';
import { savedSortsFamilyState } from '@/ui/view-bar/states/savedSortsFamilyState';
import { savedSortsByKeyFamilySelector } from '@/ui/view-bar/states/selectors/savedSortsByKeyFamilySelector';
import { sortsScopedState } from '@/ui/view-bar/states/sortsScopedState';
import { Sort } from '@/ui/view-bar/types/Sort';
import {
  useCreateViewSortsMutation,
  useDeleteViewSortsMutation,
  useGetViewSortsQuery,
  useUpdateViewSortMutation,
  ViewSortDirection,
} from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useViewSorts = ({
  scopeContext,
  skipFetch,
}: {
  scopeContext: Context<string | null>;
  skipFetch?: boolean;
}) => {
  const currentViewId = useRecoilScopedValue(
    currentViewIdScopedState,
    scopeContext,
  );
  const [sorts, setSorts] = useRecoilScopedState(
    sortsScopedState,
    scopeContext,
  );
  const [availableSorts] = useRecoilScopedState(
    availableSortsScopedState,
    scopeContext,
  );
  const [, setSavedSorts] = useRecoilState(
    savedSortsFamilyState(currentViewId),
  );
  const savedSortsByKey = useRecoilValue(
    savedSortsByKeyFamilySelector(currentViewId),
  );

  const { refetch } = useGetViewSortsQuery({
    skip: !currentViewId || skipFetch,
    variables: {
      where: {
        viewId: { equals: currentViewId },
      },
    },
    onCompleted: (data) => {
      const nextSorts = data.viewSorts
        .map((viewSort) => {
          const foundCorrespondingSortDefinition = availableSorts.find(
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

      if (!isDeeplyEqual(sorts, nextSorts)) {
        setSavedSorts(nextSorts);
        setSorts(nextSorts);
      }
    },
  });

  const [createViewSortsMutation] = useCreateViewSortsMutation();
  const [updateViewSortMutation] = useUpdateViewSortMutation();
  const [deleteViewSortsMutation] = useDeleteViewSortsMutation();

  const createViewSorts = useCallback(
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

  const updateViewSorts = useCallback(
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

  const deleteViewSorts = useCallback(
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

  const persistSorts = useCallback(async () => {
    if (!currentViewId) return;

    const sortsToCreate = sorts.filter((sort) => !savedSortsByKey[sort.key]);
    await createViewSorts(sortsToCreate);

    const sortsToUpdate = sorts.filter(
      (sort) =>
        savedSortsByKey[sort.key] &&
        savedSortsByKey[sort.key].direction !== sort.direction,
    );
    await updateViewSorts(sortsToUpdate);

    const sortKeys = sorts.map((sort) => sort.key);
    const sortKeysToDelete = Object.keys(savedSortsByKey).filter(
      (previousSortKey) => !sortKeys.includes(previousSortKey),
    );
    await deleteViewSorts(sortKeysToDelete);

    return refetch();
  }, [
    currentViewId,
    sorts,
    createViewSorts,
    updateViewSorts,
    savedSortsByKey,
    deleteViewSorts,
    refetch,
  ]);

  return { createViewSorts, persistSorts };
};
