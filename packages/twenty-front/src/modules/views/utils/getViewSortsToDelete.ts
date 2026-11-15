import { type ViewSort } from '@/views/types/ViewSort';
import { isSameViewSortTarget } from '@/views/utils/isSameViewSortTarget';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

export const getViewSortsToDelete = (
  currentViewSorts: ViewSort[],
  newViewSorts: ViewSort[],
) => {
  return currentViewSorts.filter(
    (currentViewSort) =>
      !newViewSorts.some(
        (newViewSort) =>
          compareStrictlyExceptForNullAndUndefined(
            currentViewSort.id,
            newViewSort.id,
          ) || isSameViewSortTarget(currentViewSort, newViewSort),
      ),
  );
};
