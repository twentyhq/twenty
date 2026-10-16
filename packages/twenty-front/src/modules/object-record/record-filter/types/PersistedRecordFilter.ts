import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export type PersistedRecordFilter = Pick<
  RecordFilter,
  | 'id'
  | 'fieldMetadataId'
  | 'operand'
  | 'value'
  | 'recordFilterGroupId'
  | 'positionInRecordFilterGroup'
  | 'subFieldName'
  | 'relationTargetFieldMetadataId'
>;
