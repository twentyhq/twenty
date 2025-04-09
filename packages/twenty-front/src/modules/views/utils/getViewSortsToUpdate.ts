import { ViewSort } from '@/views/types/ViewSort';
import { areViewSortsEqual } from '@/views/utils/areViewSortsEqual';
import { isDefined } from 'twenty-shared/utils';

export const getViewSortsToUpdate = (
  currentViewSorts: ViewSort[],
  newViewSorts: ViewSort[],
) => {
  return newViewSorts.filter((newViewSort) => {
    const correspondingViewSort = currentViewSorts.find(
      (currentViewSort) =>
        currentViewSort.fieldMetadataId === newViewSort.fieldMetadataId,
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
