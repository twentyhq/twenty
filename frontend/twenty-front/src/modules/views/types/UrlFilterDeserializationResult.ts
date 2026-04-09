import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';

export type UrlFilterDeserializationResult = {
  recordFilters: RecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
};
