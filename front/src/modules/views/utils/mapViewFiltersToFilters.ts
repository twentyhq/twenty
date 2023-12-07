import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';

import { ViewFilter } from '../types/ViewFilter';

export const mapViewFiltersToFilters = (
  viewFilters: ViewFilter[],
): Filter[] => {
  return viewFilters.map((viewFilter) => {
    return {
      fieldMetadataId: viewFilter.fieldMetadataId,
      value: viewFilter.value,
      displayValue: viewFilter.displayValue,
      operand: viewFilter.operand,
      definition: viewFilter.definition,
    };
  });
};
