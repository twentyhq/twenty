import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isRecordFilterValueValid } from 'twenty-shared/utils';

export const isRecordFilterConsideredEmpty = (
  recordFilter: RecordFilter,
): boolean => {
  return !isRecordFilterValueValid(recordFilter);
};
