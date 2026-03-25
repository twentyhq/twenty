import { type ViewFilter } from '@/views/types/ViewFilter';
import { isDefined } from 'twenty-shared/utils';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

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
