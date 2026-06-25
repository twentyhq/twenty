import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export type ChartFilters = {
  recordFilters?: RecordFilter[];
  recordFilterGroups?: RecordFilterGroup[];
};
