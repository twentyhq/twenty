import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export type FindRecordsActionFilter = {
  recordFilterGroups?: RecordFilterGroup[];
  recordFilters?: RecordFilter[];
};
