import { isDefined } from 'twenty-shared/utils';
import { type ViewSort } from '@/views/types/ViewSort';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

export const getViewSortsToCreate = (
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

    const shouldCreateBecauseViewSortIsNew = !isDefined(correspondingViewSort);

    return shouldCreateBecauseViewSortIsNew;
  });
};
