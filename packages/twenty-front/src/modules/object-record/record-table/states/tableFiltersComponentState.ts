import { createComponentState } from 'twenty-ui';

import { Filter } from '../../object-filter-dropdown/types/Filter';

export const tableFiltersComponentState = createComponentState<Filter[]>({
  key: 'tableFiltersComponentState',
  defaultValue: [],
});
