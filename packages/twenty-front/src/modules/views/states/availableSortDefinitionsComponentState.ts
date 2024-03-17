import { createComponentState } from 'twenty-ui';

import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';

export const availableSortDefinitionsComponentState = createComponentState<
  SortDefinition[]
>({
  key: 'availableSortDefinitionsComponentState',
  defaultValue: [],
});
