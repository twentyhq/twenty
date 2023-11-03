import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { SortDefinition } from '../types/SortDefinition';

export const availableSortDefinitionsScopedState = createScopedState<
  SortDefinition[]
>({
  key: 'availableSortDefinitionsScopedState',
  defaultValue: [],
});
