import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

import { SortDefinition } from '../types/SortDefinition';

export const availableSortDefinitionsScopedState = createStateScopeMap<
  SortDefinition[]
>({
  key: 'availableSortDefinitionsScopedState',
  defaultValue: [],
});
