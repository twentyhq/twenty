import { createComponentState } from 'twenty-ui';

import { SortDefinition } from '../types/SortDefinition';

export const availableSortDefinitionsComponentState = createComponentState<
  SortDefinition[]
>({
  key: 'availableSortDefinitionsComponentState',
  defaultValue: [],
});
