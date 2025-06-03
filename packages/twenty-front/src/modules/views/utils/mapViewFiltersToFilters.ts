import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { isSystemSearchVectorField } from '@/object-record/utils/isSystemSearchVectorField';
import { isDefined } from 'twenty-shared/utils';
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

      const label = isSystemSearchVectorField(availableFieldMetadataItem.name)
        ? 'Search'
        : availableFieldMetadataItem.label;

      return {
        id: viewFilter.id,
        fieldMetadataId: viewFilter.fieldMetadataId,
        value: viewFilter.value,
        displayValue: viewFilter.displayValue,
        operand: viewFilter.operand,
        recordFilterGroupId: viewFilter.viewFilterGroupId,
        positionInRecordFilterGroup: viewFilter.positionInViewFilterGroup,
        label,
        type: filterType,
        subFieldName: viewFilter.subFieldName,
      } satisfies RecordFilter;
    })
    .filter(isDefined);
};
