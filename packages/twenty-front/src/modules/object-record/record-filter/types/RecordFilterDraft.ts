import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export type FilterDraft = Partial<RecordFilter> &
  Omit<RecordFilter, 'fieldMetadataId' | 'operand' | 'definition'>;
