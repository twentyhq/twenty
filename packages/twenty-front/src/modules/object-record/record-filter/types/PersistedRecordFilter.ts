import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export type PersistedRecordFilter = Pick<
  RecordFilter,
  | 'fieldMetadataId'
  | 'operand'
  | 'recordFilterGroupId'
  | 'positionInRecordFilterGroup'
  | 'subFieldName'
  | 'relationTargetFieldMetadataId'
  | 'contextKey'
> & {
  id?: string;
  value?: string;
};
