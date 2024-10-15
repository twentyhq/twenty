import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { createState } from 'twenty-ui';

export const contextStoreTargetedRecordsFiltersState = createState<Filter[]>({
  key: 'contextStoreTargetedRecordsFiltersState',
  defaultValue: [],
});
