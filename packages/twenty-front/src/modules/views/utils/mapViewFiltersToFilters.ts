import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { isDefined } from '~/utils/isDefined';

import { getSubMenuOptions } from '@/object-record/object-filter-dropdown/utils/getSubMenuOptions';
import { isCompositeField } from '@/object-record/object-filter-dropdown/utils/isCompositeField';
import { ViewFilter } from '../types/ViewFilter';

const getDefinitionForFilter = (
  viewFilter: ViewFilter,
  filterDefinition: FilterDefinition,
) => {
  if (
    viewFilter.definition !== undefined &&
    isCompositeField(viewFilter.definition.type) === true
  ) {
    return {
      ...filterDefinition,
      label: viewFilter.definition.label,
      isSubField: getSubMenuOptions(viewFilter.definition.type).includes(
        viewFilter.definition.label,
      ),
    };
  } else {
    return filterDefinition;
  }
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
