import { type ViewFilter } from '@/views/types/ViewFilter';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

export const getViewFiltersToDelete = (
  currentViewFilters: ViewFilter[],
  newViewFilters: ViewFilter[],
) => {
  return currentViewFilters.filter(
    (currentViewFilter) =>
      !newViewFilters.some((newViewFilter) =>
        compareStrictlyExceptForNullAndUndefined(
          currentViewFilter.id,
          newViewFilter.id,
        ),
      ),
  );
};
