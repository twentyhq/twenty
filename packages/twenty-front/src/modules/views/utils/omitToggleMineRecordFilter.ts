import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { TOGGLE_MINE_RECORD_FILTER_ID } from '@/views/constants/ToggleMineRecordFilterId';

// The All/Mine toggle is a personal lens on a shared view, so it must never be persisted to the view
export const omitToggleMineRecordFilter = (recordFilters: RecordFilter[]) =>
  recordFilters.filter(
    (recordFilter) => recordFilter.id !== TOGGLE_MINE_RECORD_FILTER_ID,
  );
