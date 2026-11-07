import { useRecordIndexContextOrUndefined } from '@/object-record/record-index/contexts/RecordIndexContext';

const NO_EXCLUDED_RECORD_FILTER_IDS: string[] = [];

export const useRecordIndexExcludedRecordFilterIds = (): string[] =>
  useRecordIndexContextOrUndefined()?.excludedRecordFilterIds ??
  NO_EXCLUDED_RECORD_FILTER_IDS;
