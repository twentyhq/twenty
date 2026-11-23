import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { mapRecordFilterGroupLogicalOperatorToViewFilterGroupLogicalOperator } from '@/views/utils/mapRecordFilterGroupLogicalOperatorToViewFilterGroupLogicalOperator';
import { type ViewFieldRelationScope } from 'twenty-shared/types';

const sortByPositionInRecordFilterGroup = <
  TPositioned extends { positionInRecordFilterGroup?: number | null },
>(
  positionedItems: TPositioned[],
) =>
  positionedItems.toSorted(
    (positionedItemA, positionedItemB) =>
      (positionedItemA.positionInRecordFilterGroup ?? 0) -
      (positionedItemB.positionInRecordFilterGroup ?? 0),
  );

export const getRelationScopeFromRecordFiltersAndSorts = ({
  recordFilters,
  recordFilterGroups,
  recordSorts,
  limit,
}: {
  recordFilters: RecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
  recordSorts: RecordSort[];
  limit: number | null;
}): ViewFieldRelationScope => ({
  // A scope stores no position, so the rank of its filters and filter groups carries their order
  filters: sortByPositionInRecordFilterGroup(recordFilters).map(
    (recordFilter) => ({
      id: recordFilter.id,
      fieldMetadataId: recordFilter.fieldMetadataId,
      operand: recordFilter.operand,
      value: recordFilter.value,
      subFieldName: recordFilter.subFieldName ?? null,
      relationTargetFieldMetadataId:
        recordFilter.relationTargetFieldMetadataId ?? null,
      filterGroupId: recordFilter.recordFilterGroupId ?? null,
    }),
  ),
  filterGroups: sortByPositionInRecordFilterGroup(recordFilterGroups).map(
    (recordFilterGroup) => ({
      id: recordFilterGroup.id,
      parentFilterGroupId: recordFilterGroup.parentRecordFilterGroupId ?? null,
      logicalOperator:
        mapRecordFilterGroupLogicalOperatorToViewFilterGroupLogicalOperator({
          recordFilterGroupLogicalOperator: recordFilterGroup.logicalOperator,
        }),
    }),
  ),
  sorts: recordSorts.map((recordSort) => ({
    fieldMetadataId: recordSort.fieldMetadataId,
    direction: recordSort.direction,
    subFieldName: recordSort.subFieldName ?? null,
    relationTargetFieldMetadataId:
      recordSort.relationTargetFieldMetadataId ?? null,
  })),
  limit,
});
