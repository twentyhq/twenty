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
  // All field metadata items across every object, used to resolve relation
  // traversal targets that live on a different object than the source field.
  // Defaults to `availableFieldMetadataItems` for non-traversal callers.
  allFieldMetadataItems: FieldMetadataItem[] = availableFieldMetadataItems,
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

      // The codegen-generated `GqlViewFilter` and the local `ViewFilter`
      // type don't both expose this field; `in` narrows safely across both.
      const relationTargetFieldMetadataId =
        'relationTargetFieldMetadataId' in viewFilter
          ? (viewFilter.relationTargetFieldMetadataId ?? null)
          : null;

      const relationTargetFieldMetadataItem = isDefined(
        relationTargetFieldMetadataId,
      )
        ? allFieldMetadataItems.find(
            (fieldMetadataItem) =>
              fieldMetadataItem.id === relationTargetFieldMetadataId,
          )
        : undefined;

      // For relation traversal, the operand picker / value input must match
      // the target field's type, and the label must reflect both hops so the
      // filter is recognizable in the UI (e.g. "Company → Name").
      const filterType = isDefined(relationTargetFieldMetadataItem)
        ? getFilterTypeFromFieldType(relationTargetFieldMetadataItem.type)
        : getFilterTypeFromFieldType(availableFieldMetadataItem.type);

      const label = isSystemSearchVectorField(availableFieldMetadataItem.name)
        ? 'Search'
        : isDefined(relationTargetFieldMetadataItem)
          ? `${availableFieldMetadataItem.label} → ${relationTargetFieldMetadataItem.label}`
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
        relationTargetFieldMetadataId,
      } satisfies RecordFilter;
    })
    .filter(isDefined);
};
