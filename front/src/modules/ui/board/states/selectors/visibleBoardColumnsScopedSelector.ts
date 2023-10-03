import { selectorFamily } from 'recoil';

import { boardColumnsState } from '../boardColumnsState';

export const visibleBoardColumnsScopedSelector = selectorFamily({
  key: 'visibleBoardColumnsScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) =>
      get(boardColumnsState).filter((field) => field.isVisible),
});
