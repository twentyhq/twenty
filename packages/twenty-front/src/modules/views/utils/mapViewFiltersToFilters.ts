import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isDefined } from 'twenty-shared';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { ViewFilter } from '../types/ViewFilter';

export const mapViewFiltersToFilters = (
  viewFilters: ViewFilter[],
  availableFieldMetadataItems: FieldMetadataItem[],
): RecordFilter[] => {
  return viewFilters
    .map((viewFilter) => {
      const availableFieldMetadataItem = availableFieldMetadataItems.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === viewFilter.fieldMetadataId,
      );

      if (!isDefined(availableFieldMetadataItem)) {
        // Todo: we we don't throw an error yet as we have race condition on view change
        return undefined;
      }

      const filterType = getFilterTypeFromFieldType(
        availableFieldMetadataItem.type,
      );

      return {
        id: viewFilter.id,
        fieldMetadataId: viewFilter.fieldMetadataId,
        value: viewFilter.value,
        displayValue: viewFilter.displayValue,
        operand: viewFilter.operand,
        viewFilterGroupId: viewFilter.viewFilterGroupId,
        positionInViewFilterGroup: viewFilter.positionInViewFilterGroup,
        label: availableFieldMetadataItem.label,
        type: filterType,
      };
    })
    .filter(isDefined);
};
