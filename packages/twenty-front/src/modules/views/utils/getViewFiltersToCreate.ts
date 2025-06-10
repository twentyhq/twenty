import { ViewFilter } from '@/views/types/ViewFilter';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';
import { isDefined } from 'twenty-shared/utils';

export const getViewFiltersToCreate = (
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

    const shouldCreateBecauseViewFilterIsNew = !isDefined(
      correspondingViewFilter,
    );

    return shouldCreateBecauseViewFilterIsNew;
  });
};
