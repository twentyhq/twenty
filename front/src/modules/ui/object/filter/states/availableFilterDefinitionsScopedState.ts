import { FilterDefinition } from '@/ui/object/filter/types/FilterDefinition';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const availableFilterDefinitionsScopedState = createScopedState<
  FilterDefinition[]
>({
  key: 'availableFilterDefinitionsScopedState',
  defaultValue: [],
});
