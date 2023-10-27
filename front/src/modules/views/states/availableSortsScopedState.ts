import { SortDefinition } from '@/ui/data/sort/types/SortDefinition';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const availableSortsScopedState = createScopedState<SortDefinition[]>({
  key: 'availableSortsScopedState',
  defaultValue: [],
});
