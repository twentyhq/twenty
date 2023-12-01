import { Filter } from '@/ui/object/object-filter-dropdown/types/Filter';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const boardFiltersScopedState = createScopedState<Filter[]>({
  key: 'boardFiltersScopedState',
  defaultValue: [],
});
