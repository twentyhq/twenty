import { Filter } from '@/ui/object/filter/types/Filter';

import { ViewFilter } from '../types/ViewFilter';

export const viewFiltersToFilters = (viewFilters: ViewFilter[]): Filter[] => {
  return viewFilters.map((viewFilter) => {
    return {
      fieldId: viewFilter.fieldId,
      value: viewFilter.value,
      displayValue: viewFilter.displayValue,
      operand: viewFilter.operand,
      definition: viewFilter.definition,
    };
  });
};
