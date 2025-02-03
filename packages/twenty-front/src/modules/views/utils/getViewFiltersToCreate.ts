import { ViewFilter } from '@/views/types/ViewFilter';
import { isDefined } from 'twenty-shared';

export const getViewFiltersToCreate = (
  currentViewFilters: ViewFilter[],
  newViewFilters: ViewFilter[],
) => {
  return newViewFilters.filter((newViewFilter) => {
    const correspondingViewFilter = currentViewFilters.find(
      (currentViewFilter) =>
        currentViewFilter.fieldMetadataId === newViewFilter.fieldMetadataId &&
        currentViewFilter.viewFilterGroupId === newViewFilter.viewFilterGroupId,
    );

    const shouldCreateBecauseViewFilterIsNew = !isDefined(
      correspondingViewFilter,
    );

    return shouldCreateBecauseViewFilterIsNew;
  });
};
