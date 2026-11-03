import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';

export type RecordFiltersWithGroups = {
  recordFilters?: PersistedRecordFilter[];
  recordFilterGroups?: RecordFilterGroup[];
};
