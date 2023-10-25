import { FilterDefinition } from '@/ui/data/view-bar/types/FilterDefinition';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const availableFiltersScopedState = createScopedState<
  FilterDefinition[]
>({
  key: 'availableFiltersScopedState',
  defaultValue: [],
});
