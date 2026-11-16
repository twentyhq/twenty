import { type ViewSort } from '@/views/types/ViewSort';
import { areViewSortsEqual } from '@/views/utils/areViewSortsEqual';
import { isViewSortOnSameField } from '@/views/utils/isViewSortOnSameField';
import { isDefined } from 'twenty-shared/utils';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

// A sort removed and added back comes back under a new id: it updates the saved sort on its field
export const getViewSortsToUpdate = (
  currentViewSorts: ViewSort[],
  newViewSorts: ViewSort[],
): ViewSort[] =>
  newViewSorts.flatMap((newViewSort) => {
    const correspondingViewSort =
      currentViewSorts.find((currentViewSort) =>
        compareStrictlyExceptForNullAndUndefined(
          currentViewSort.id,
          newViewSort.id,
        ),
      ) ??
      currentViewSorts.find((currentViewSort) =>
        isViewSortOnSameField(currentViewSort, newViewSort),
      );

    if (
      !isDefined(correspondingViewSort) ||
      areViewSortsEqual(newViewSort, correspondingViewSort)
    ) {
      return [];
    }

    return [{ ...newViewSort, id: correspondingViewSort.id }];
  });
