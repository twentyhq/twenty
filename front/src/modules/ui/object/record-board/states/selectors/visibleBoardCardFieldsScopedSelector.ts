import { selectorFamily } from 'recoil';

import { boardCardFieldsScopedFamilyState } from '../boardCardFieldsScopedFamilyState';

export const visibleBoardCardFieldsScopedSelector = selectorFamily({
  key: 'visibleBoardCardFieldsScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) =>
      get(boardCardFieldsScopedFamilyState(scopeId))
        .filter((field) => field.isVisible)
        .sort((a, b) => a.position - b.position),
});
