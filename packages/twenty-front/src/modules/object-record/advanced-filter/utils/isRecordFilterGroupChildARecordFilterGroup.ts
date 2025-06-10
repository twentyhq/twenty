import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export const isRecordFilterGroupChildARecordFilterGroup = (
  child: RecordFilter | RecordFilterGroup,
): child is RecordFilterGroup => {
  return ('logicalOperator' satisfies keyof RecordFilterGroup) in child;
};
