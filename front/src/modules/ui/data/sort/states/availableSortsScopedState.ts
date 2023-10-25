import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { SortDefinition } from '../types/SortDefinition';

export const availableSortsScopedState = createScopedState<SortDefinition[]>({
  key: 'availableSortsScopedState',
  defaultValue: [],
});
