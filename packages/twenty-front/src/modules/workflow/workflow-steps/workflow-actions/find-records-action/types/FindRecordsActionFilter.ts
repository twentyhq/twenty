import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import { type SetOptional } from 'type-fest';

export type FindRecordsActionFilter = {
  recordFilterGroups?: RecordFilterGroup[];
  recordFilters?: SetOptional<PersistedRecordFilter, 'id' | 'value'>[];
};
