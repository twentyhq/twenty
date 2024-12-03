import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';

export type FilterDraft = Partial<Filter> &
  Omit<Filter, 'fieldMetadataId' | 'operand' | 'definition'>;
