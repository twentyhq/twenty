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
  fieldMetadataItems: FieldMetadataItem[],
): RecordFilter[] => {
  return viewFilters
    .map((viewFilter) => {
      const sourceFieldMetadataItem = fieldMetadataItems.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === viewFilter.fieldMetadataId,
      );

      if (!isDefined(sourceFieldMetadataItem)) {
        // Todo: we don't throw an error yet as we have race condition on view change
        return undefined;
      }

      const relationTargetFieldMetadataItem = isDefined(
        viewFilter.relationTargetFieldMetadataId,
      )
        ? fieldMetadataItems.find(
            (fieldMetadataItem) =>
              fieldMetadataItem.id === viewFilter.relationTargetFieldMetadataId,
          )
        : undefined;

      // A relation-traversal filter is meaningful only if both ends
      // resolve — drop it otherwise (same race-condition handling as the
      // source field above) instead of rendering a chip whose filterType
      // and label fall back to the relation source, since the dispatcher
      // would silently drop the GraphQL filter anyway.
      if (
        isDefined(viewFilter.relationTargetFieldMetadataId) &&
        !isDefined(relationTargetFieldMetadataItem)
      ) {
        return undefined;
      }

      const filterType = isDefined(relationTargetFieldMetadataItem)
        ? getFilterTypeFromFieldType(relationTargetFieldMetadataItem.type)
        : getFilterTypeFromFieldType(sourceFieldMetadataItem.type);

      const label = isSystemSearchVectorField(sourceFieldMetadataItem.name)
        ? 'Search'
        : isDefined(relationTargetFieldMetadataItem)
          ? `${sourceFieldMetadataItem.label} → ${relationTargetFieldMetadataItem.label}`
          : sourceFieldMetadataItem.label;

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
        relationTargetFieldMetadataId:
          viewFilter.relationTargetFieldMetadataId ?? null,
      } satisfies RecordFilter;
    })
    .filter(isDefined);
};
