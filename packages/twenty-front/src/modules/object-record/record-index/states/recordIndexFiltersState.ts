import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { createState } from '@/ui/utilities/state/utils/createState';

export const recordIndexFiltersState = createState<Filter[]>({
  key: 'recordIndexFiltersState',
  defaultValue: [],
});
