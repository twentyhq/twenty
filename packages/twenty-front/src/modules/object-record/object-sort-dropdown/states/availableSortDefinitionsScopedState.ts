import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { SortDefinition } from '../types/SortDefinition';

export const availableSortDefinitionsScopedState = createComponentState<
  SortDefinition[]
>({
  key: 'availableSortDefinitionsScopedState',
  defaultValue: [],
});
