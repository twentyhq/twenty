import { RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export const isRecordFilterGroupChildARecordFilter = (
  child: RecordFilter | RecordFilterGroup,
): child is RecordFilter => {
  return ('fieldMetadataId' satisfies keyof RecordFilter) in child;
};
