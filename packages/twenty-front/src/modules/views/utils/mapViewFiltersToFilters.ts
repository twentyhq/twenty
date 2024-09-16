import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { isDefined } from '~/utils/isDefined';

import { hasSubMenuFilter } from '@/object-record/object-filter-dropdown/utils/hasSubMenuFilter';
import { ViewFilter } from '../types/ViewFilter';

const getDefinitionForFilter = (
  viewFilter: ViewFilter,
  availableFilterDefinition: FilterDefinition,
) => {
  return {
    ...availableFilterDefinition,
    subFieldType:
      hasSubMenuFilter(availableFilterDefinition.type) &&
      viewFilter.definition?.type !== availableFilterDefinition.type
        ? viewFilter.definition?.type
        : undefined,
  };
};

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
        definition: getDefinitionForFilter(
          viewFilter,
          availableFilterDefinition,
        ),
      };
    })
    .filter(isDefined);
};
