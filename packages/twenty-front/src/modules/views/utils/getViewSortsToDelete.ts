import { type ViewSort } from '@/views/types/ViewSort';
import { isViewSortOnSameField } from '@/views/utils/isViewSortOnSameField';
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
          ) || isViewSortOnSameField(currentViewSort, newViewSort),
      ),
  );
};
