import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator } from '@/views/utils/mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { type ViewFieldRelationScope } from 'twenty-shared/types';
import { convertViewFilterValueToString } from 'twenty-shared/utils';

export const getRelationScopeRecordFiltersAndSorts = ({
  relationScope,
  fieldMetadataItems,
}: {
  relationScope: Pick<
    ViewFieldRelationScope,
    'filters' | 'filterGroups' | 'sorts'
  >;
  fieldMetadataItems: FieldMetadataItem[];
}): {
  recordFilters: RecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
  recordSorts: RecordSort[];
} => ({
  recordFilters: mapViewFiltersToFilters(
    relationScope.filters.map((filter) => ({
      id: filter.id,
      fieldMetadataId: filter.fieldMetadataId,
      operand: filter.operand,
      value: convertViewFilterValueToString(filter.value),
      viewFilterGroupId: filter.filterGroupId,
      subFieldName: filter.subFieldName,
      relationTargetFieldMetadataId: filter.relationTargetFieldMetadataId,
    })),
    fieldMetadataItems,
  ),
  recordFilterGroups: relationScope.filterGroups.map((filterGroup) => ({
    id: filterGroup.id,
    parentRecordFilterGroupId: filterGroup.parentFilterGroupId,
    logicalOperator:
      mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator({
        viewFilterGroupLogicalOperator: filterGroup.logicalOperator,
      }),
  })),
  // Scope sorts carry no id: their rank in the scope identifies them
  recordSorts: relationScope.sorts.map((sort, sortIndex) => ({
    id: String(sortIndex),
    fieldMetadataId: sort.fieldMetadataId,
    direction: sort.direction,
    subFieldName: sort.subFieldName,
    relationTargetFieldMetadataId: sort.relationTargetFieldMetadataId,
  })),
});
