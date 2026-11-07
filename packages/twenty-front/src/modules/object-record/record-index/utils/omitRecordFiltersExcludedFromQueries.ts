import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const omitRecordFiltersExcludedFromQueries = ({
  recordFilters,
  excludedRecordFilterIds,
}: {
  recordFilters: RecordFilter[];
  excludedRecordFilterIds: string[];
}): RecordFilter[] =>
  isNonEmptyArray(excludedRecordFilterIds)
    ? recordFilters.filter(({ id }) => !excludedRecordFilterIds.includes(id))
    : recordFilters;
