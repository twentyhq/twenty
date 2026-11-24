import { type ViewSort } from '@/views/types/ViewSort';
import { isViewSortOnSameField } from '@/views/utils/isViewSortOnSameField';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

// A sort on a saved sort's field updates it instead, see getViewSortsToUpdate
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
          ) || isViewSortOnSameField(currentViewSort, newViewSort),
      ),
  );
};
