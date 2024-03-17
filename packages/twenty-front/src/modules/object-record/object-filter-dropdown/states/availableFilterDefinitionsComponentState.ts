import { createComponentState } from 'twenty-ui';

import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';

export const availableFilterDefinitionsComponentState = createComponentState<
  FilterDefinition[]
>({
  key: 'availableFilterDefinitionsComponentState',
  defaultValue: [],
});
