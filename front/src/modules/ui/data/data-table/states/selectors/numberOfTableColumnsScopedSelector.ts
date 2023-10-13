import { selectorFamily } from 'recoil';

import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const numberOfTableColumnsScopedSelector = selectorFamily({
  key: 'numberOfTableColumnsScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) =>
      get(tableColumnsScopedState(scopeId)).length,
});
