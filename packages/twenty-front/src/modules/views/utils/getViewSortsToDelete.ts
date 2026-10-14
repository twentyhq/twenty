import { isSameRecordSortTarget } from '@/object-record/record-sort/utils/isSameRecordSortTarget';
import { type ViewSort } from '@/views/types/ViewSort';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

const isSameSortTarget = (sortA: ViewSort, sortB: ViewSort): boolean =>
  isSameRecordSortTarget(sortA, sortB) && sortA.direction === sortB.direction;

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
          ) || isSameSortTarget(currentViewSort, newViewSort),
      ),
  );
};
