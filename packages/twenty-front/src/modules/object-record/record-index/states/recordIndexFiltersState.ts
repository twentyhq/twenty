import { createState } from '@ui/utilities/state/utils/createState';

import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';

export const recordIndexFiltersState = createState<Filter[]>({
  key: 'recordIndexFiltersState',
  defaultValue: [],
});
