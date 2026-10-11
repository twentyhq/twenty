import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import { type SetOptional } from 'type-fest';

// Chart widgets defined by applications may omit filter ids
export type ChartFilters = {
  recordFilters?: SetOptional<PersistedRecordFilter, 'id'>[];
  recordFilterGroups?: RecordFilterGroup[];
};
