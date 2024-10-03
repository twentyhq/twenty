import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { hasSubMenuFilter } from '@/object-record/object-filter-dropdown/utils/hasSubMenuFilter';
import { ViewFilter } from '../types/ViewFilter';

export const getFilterDefinitionForViewFilter = (
  viewFilter: ViewFilter,
  availableFilterDefinition: FilterDefinition,
): FilterDefinition => {
  return {
    ...availableFilterDefinition,
    subFieldType:
      hasSubMenuFilter(availableFilterDefinition.type) &&
      viewFilter.definition?.type !== availableFilterDefinition.type
        ? viewFilter.definition?.type
        : undefined,
  };
};
