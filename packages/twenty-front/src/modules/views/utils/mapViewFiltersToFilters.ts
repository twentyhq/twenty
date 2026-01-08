import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

import { isSystemSearchVectorField } from '@/object-record/utils/isSystemSearchVectorField';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import { type CoreViewFilter } from '~/generated/graphql';
import { type ViewFilter } from '@/views/types/ViewFilter';

export const mapViewFiltersToFilters = (
  viewFilters: ViewFilter[] | CoreViewFilter[],
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

      const operand = viewFilter.operand;

      return {
        id: viewFilter.id,
        fieldMetadataId: viewFilter.fieldMetadataId,
        value: viewFilter.value,
        displayValue:
          'displayValue' in viewFilter
            ? viewFilter.displayValue
            : viewFilter.value,
        operand,
        recordFilterGroupId: viewFilter.viewFilterGroupId,
        positionInRecordFilterGroup: viewFilter.positionInViewFilterGroup,
        label,
        type: filterType,
        subFieldName: viewFilter.subFieldName as CompositeFieldSubFieldName,
      } satisfies RecordFilter;
    })
    .filter(isDefined);
};
