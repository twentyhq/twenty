import { createScopedSelector } from '@/ui/utilities/recoil-scope/utils/createScopedSelector';

import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const numberOfTableColumnsScopedSelector = createScopedSelector({
  key: 'numberOfTableColumnsScopedSelector',
  get:
    ({ scopeId }) =>
    ({ get }) =>
      get(tableColumnsScopedState({ scopeId })).length,
});
