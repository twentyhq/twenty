import { ViewFilter } from '@/views/types/ViewFilter';

export const getViewFiltersToDelete = (
  currentViewFilters: ViewFilter[],
  newViewFilters: ViewFilter[],
) => {
  return currentViewFilters.filter(
    (currentViewFilter) =>
      !newViewFilters.some(
        (newViewFilter) =>
          newViewFilter.fieldMetadataId === currentViewFilter.fieldMetadataId &&
          newViewFilter.viewFilterGroupId ===
            currentViewFilter.viewFilterGroupId,
      ),
  );
};
