import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { mapRecordFilterGroupLogicalOperatorToViewFilterGroupLogicalOperator } from '@/views/utils/mapRecordFilterGroupLogicalOperatorToViewFilterGroupLogicalOperator';
import { type ViewFieldScopeInput } from '~/generated-metadata/graphql';

export type ColumnScope = {
  recordFilters: RecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
  recordSorts: RecordSort[];
};

// Groups alone filter nothing, so a scope without filters or sorts is removed
export const buildViewFieldScopeInput = ({
  recordFilters,
  recordFilterGroups,
  recordSorts,
}: ColumnScope): ViewFieldScopeInput | null => {
  if (recordFilters.length === 0 && recordSorts.length === 0) {
    return null;
  }

  return {
    viewFilters: recordFilters.map((recordFilter) => ({
      id: recordFilter.id,
      fieldMetadataId: recordFilter.fieldMetadataId,
      operand: recordFilter.operand,
      value: recordFilter.value,
      viewFilterGroupId: recordFilter.recordFilterGroupId ?? null,
      positionInViewFilterGroup:
        recordFilter.positionInRecordFilterGroup ?? null,
      subFieldName: recordFilter.subFieldName ?? null,
      relationTargetFieldMetadataId:
        recordFilter.relationTargetFieldMetadataId ?? undefined,
    })),
    viewFilterGroups: recordFilterGroups.map((recordFilterGroup) => ({
      id: recordFilterGroup.id,
      parentViewFilterGroupId:
        recordFilterGroup.parentRecordFilterGroupId ?? undefined,
      logicalOperator:
        mapRecordFilterGroupLogicalOperatorToViewFilterGroupLogicalOperator({
          recordFilterGroupLogicalOperator: recordFilterGroup.logicalOperator,
        }),
      positionInViewFilterGroup:
        recordFilterGroup.positionInRecordFilterGroup ?? undefined,
    })),
    viewSorts: recordSorts.map((recordSort) => ({
      id: recordSort.id,
      fieldMetadataId: recordSort.fieldMetadataId,
      direction: recordSort.direction,
      subFieldName: recordSort.subFieldName ?? null,
    })),
  };
};
