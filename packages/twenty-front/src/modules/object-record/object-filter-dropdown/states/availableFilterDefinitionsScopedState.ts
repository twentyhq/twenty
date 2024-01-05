import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const availableFilterDefinitionsScopedState = createStateScopeMap<
  FilterDefinition[]
>({
  key: 'availableFilterDefinitionsScopedState',
  defaultValue: [],
});
