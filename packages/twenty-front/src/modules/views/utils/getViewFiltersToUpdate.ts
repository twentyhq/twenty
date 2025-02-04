import { ViewFilter } from '@/views/types/ViewFilter';
import { areViewFiltersEqual } from '@/views/utils/areViewFiltersEqual';
import { isDefined } from 'twenty-shared';

export const getViewFiltersToUpdate = (
  currentViewFilters: ViewFilter[],
  newViewFilters: ViewFilter[],
) => {
  return newViewFilters.filter((newViewFilter) => {
    const correspondingViewFilter = currentViewFilters.find(
      (currentViewFilter) =>
        currentViewFilter.fieldMetadataId === newViewFilter.fieldMetadataId &&
        currentViewFilter.viewFilterGroupId === newViewFilter.viewFilterGroupId,
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
