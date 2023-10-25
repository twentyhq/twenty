import { FilterDefinition } from '@/ui/data/view-bar/types/FilterDefinition';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const availableViewFiltersScopedState = createScopedState<
  FilterDefinition[]
>({
  key: 'availableViewFiltersScopedState',
  defaultValue: [],
});
