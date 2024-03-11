import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { Filter } from '../../object-filter-dropdown/types/Filter';

export const tableFiltersComponentState = createComponentState<Filter[]>({
  key: 'tableFiltersComponentState',
  defaultValue: [],
});
