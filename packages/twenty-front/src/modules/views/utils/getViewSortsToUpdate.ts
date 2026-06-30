import { areViewSortsEqual } from '@/views/utils/areViewSortsEqual';
import { isDefined } from 'twenty-shared/utils';
import { type ViewSort } from '@/views/types/ViewSort';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

export const getViewSortsToUpdate = (
  currentViewSorts: ViewSort[],
  newViewSorts: ViewSort[],
) => {
  return newViewSorts.filter((newViewSort) => {
    const correspondingViewSort = currentViewSorts.find((currentViewSort) =>
      compareStrictlyExceptForNullAndUndefined(
        currentViewSort.id,
        newViewSort.id,
      ),
    );

    if (!isDefined(correspondingViewSort)) {
      return false;
    }

    const shouldUpdateBecauseViewSortIsDifferent = !areViewSortsEqual(
      newViewSort,
      correspondingViewSort,
    );

    return shouldUpdateBecauseViewSortIsDifferent;
  });
};
