import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';

export type ChartFilters = {
  recordFilters?: PersistedRecordFilter[];
  recordFilterGroups?: RecordFilterGroup[];
};
