import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const availableSortDefinitionsScopedState = createStateScopeMap<
  SortDefinition[]
>({
  key: 'availableSortDefinitionsScopedState',
  defaultValue: [],
});
