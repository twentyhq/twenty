import { createComponentState } from 'twenty-ui';

import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';

export const recordBoardFiltersComponentState = createComponentState<Filter[]>({
  key: 'recordBoardFiltersComponentState',
  defaultValue: [],
});
