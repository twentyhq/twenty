import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

import { Sort } from '../../object-sort-dropdown/types/Sort';

export const tableSortsScopedState = createScopedState<Sort[]>({
  key: 'tableSortsScopedState',
  defaultValue: [],
});
