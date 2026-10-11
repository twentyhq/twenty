import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

// Record filters stored outside of views (workflow Find Records steps, chart
// widgets) only reference fields; type, label and display value are derived
// from field metadata when they are loaded
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
