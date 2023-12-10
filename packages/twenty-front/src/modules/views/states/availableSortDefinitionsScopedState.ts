import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const availableSortDefinitionsScopedState = createScopedState<
  SortDefinition[]
>({
  key: 'availableSortDefinitionsScopedState',
  defaultValue: [],
});
