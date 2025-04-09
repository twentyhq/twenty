import { RecordFilterGroupLogicalOperator } from '@/object-record/record-filter-group/types/RecordFilterGroupLogicalOperator';

export type RecordFilterGroup = {
  id: string;
  parentRecordFilterGroupId?: string | null;
  logicalOperator: RecordFilterGroupLogicalOperator;
  positionInRecordFilterGroup?: number | null;
};
