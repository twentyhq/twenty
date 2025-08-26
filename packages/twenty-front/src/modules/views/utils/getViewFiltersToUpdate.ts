import { type ViewFilter } from '@/views/types/ViewFilter';
import { areViewFiltersEqual } from '@/views/utils/areViewFiltersEqual';
import { isDefined } from 'twenty-shared/utils';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

export const getViewFiltersToUpdate = (
  currentViewFilters: ViewFilter[],
  newViewFilters: ViewFilter[],
) => {
  return newViewFilters.filter((newViewFilter) => {
    const correspondingViewFilter = currentViewFilters.find(
      (currentViewFilter) =>
        compareStrictlyExceptForNullAndUndefined(
          currentViewFilter.id,
          newViewFilter.id,
        ),
    );

    if (!isDefined(correspondingViewFilter)) {
      return false;
    }

    const shouldUpdateBecauseViewFilterIsDifferent = !areViewFiltersEqual(
      newViewFilter,
      correspondingViewFilter,
    );

    return shouldUpdateBecauseViewFilterIsDifferent;
  });
};
