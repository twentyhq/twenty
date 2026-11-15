import { type ViewSort } from '@/views/types/ViewSort';
import { isSameViewSortTarget } from '@/views/utils/isSameViewSortTarget';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

// Mirrors getViewSortsToDelete, which keeps a saved sort with the same target
export const getViewSortsToCreate = (
  currentViewSorts: ViewSort[],
  newViewSorts: ViewSort[],
) => {
  return newViewSorts.filter(
    (newViewSort) =>
      !currentViewSorts.some(
        (currentViewSort) =>
          compareStrictlyExceptForNullAndUndefined(
            currentViewSort.id,
            newViewSort.id,
          ) || isSameViewSortTarget(currentViewSort, newViewSort),
      ),
  );
};
