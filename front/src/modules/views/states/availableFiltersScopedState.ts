import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';
import { FilterDefinition } from '@/views/components/view-bar/types/FilterDefinition';

export const availableFiltersScopedState = createScopedState<
  FilterDefinition[]
>({
  key: 'availableFiltersScopedState',
  defaultValue: [],
});
