import { selectorFamily } from 'recoil';

import { boardCardFieldsScopedState } from '../boardCardFieldsScopedState';

export const visibleBoardCardFieldsScopedSelector = selectorFamily({
  key: 'visibleBoardCardFieldsScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) =>
      get(boardCardFieldsScopedState(scopeId))
        .filter((field) => field.isVisible)
        .sort((a, b) => a.position - b.position),
});
