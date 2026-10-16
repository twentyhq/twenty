import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export const mapRecordFiltersToPersistedRecordFilters = (
  recordFilters: RecordFilter[],
): PersistedRecordFilter[] =>
  recordFilters.map((recordFilter) => ({
    id: recordFilter.id,
    fieldMetadataId: recordFilter.fieldMetadataId,
    operand: recordFilter.operand,
    value: recordFilter.value,
    recordFilterGroupId: recordFilter.recordFilterGroupId,
    positionInRecordFilterGroup: recordFilter.positionInRecordFilterGroup,
    subFieldName: recordFilter.subFieldName,
    relationTargetFieldMetadataId: recordFilter.relationTargetFieldMetadataId,
  }));
