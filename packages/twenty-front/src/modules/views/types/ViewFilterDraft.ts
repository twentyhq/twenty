import { ViewFilter } from '@/views/types/ViewFilter';

export type ViewFilterDraft = Partial<ViewFilter> &
  Omit<ViewFilter, 'fieldMetadataId' | 'operand' | 'definition'>;
