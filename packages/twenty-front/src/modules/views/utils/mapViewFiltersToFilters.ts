import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { isDefined } from '~/utils/isDefined';

import { ViewFilter } from '../types/ViewFilter';

export const mapViewFiltersToFilters = (
  viewFilters: ViewFilter[],
  availableFilterDefinitions: FilterDefinition[],
): Filter[] => {
  return viewFilters
    .map((viewFilter) => {
      const availableFilterDefinition = availableFilterDefinitions.find(
        (filterDefinition) =>
          filterDefinition.fieldMetadataId === viewFilter.fieldMetadataId,
      );

      if (!availableFilterDefinition) return null;

      return {
        id: viewFilter.id,
        fieldMetadataId: viewFilter.fieldMetadataId,
        value: viewFilter.value,
        displayValue: viewFilter.displayValue,
        operand: viewFilter.operand,
        definition: viewFilter.definition ?? availableFilterDefinition,
      };
    })
    .filter(isDefined);
};
