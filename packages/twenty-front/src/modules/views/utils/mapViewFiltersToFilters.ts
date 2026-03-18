import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

import { isSystemSearchVectorField } from '@/object-record/utils/isSystemSearchVectorField';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import {
  convertViewFilterValueToString,
  getFilterTypeFromFieldType,
  isDefined,
} from 'twenty-shared/utils';
import { type ViewFilter as GqlViewFilter } from '~/generated-metadata/graphql';
import { type ViewFilter } from '@/views/types/ViewFilter';

export const mapViewFiltersToFilters = (
  viewFilters: ViewFilter[] | GqlViewFilter[],
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

      const stringValue = convertViewFilterValueToString(viewFilter.value);

      return {
        id: viewFilter.id,
        fieldMetadataId: viewFilter.fieldMetadataId,
        value: stringValue,
        displayValue:
          'displayValue' in viewFilter && isDefined(viewFilter.displayValue)
            ? viewFilter.displayValue
            : stringValue,
        operand,
        recordFilterGroupId: viewFilter.viewFilterGroupId ?? undefined,
        positionInRecordFilterGroup: viewFilter.positionInViewFilterGroup,
        label,
        type: filterType,
        subFieldName: viewFilter.subFieldName as CompositeFieldSubFieldName,
      } satisfies RecordFilter;
    })
    .filter(isDefined);
};
