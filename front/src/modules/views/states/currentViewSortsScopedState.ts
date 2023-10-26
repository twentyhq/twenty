import { Sort } from '@/ui/data/sort/types/Sort';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const currentViewSortsScopedState = createScopedState<Sort[]>({
  key: 'currentViewSortsScopedState',
  defaultValue: [],
});
