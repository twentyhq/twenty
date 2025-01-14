import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isDefined } from '~/utils/isDefined';

import { RecordFilterDefinition } from '@/object-record/record-filter/types/RecordFilterDefinition';
import { ViewFilter } from '../types/ViewFilter';

export const mapViewFiltersToFilters = (
  viewFilters: ViewFilter[],
  availableFilterDefinitions: RecordFilterDefinition[],
): RecordFilter[] => {
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
        viewFilterGroupId: viewFilter.viewFilterGroupId,
        positionInViewFilterGroup: viewFilter.positionInViewFilterGroup,
        definition: viewFilter.definition ?? availableFilterDefinition,
      };
    })
    .filter(isDefined);
};
