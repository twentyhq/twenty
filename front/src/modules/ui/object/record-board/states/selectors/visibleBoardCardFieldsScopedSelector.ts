import { selectorFamily } from 'recoil';

import { boardCardFieldsFamilyState } from '../boardCardFieldsFamilyState';

export const visibleBoardCardFieldsScopedSelector = selectorFamily({
  key: 'visibleBoardCardFieldsScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) =>
      get(boardCardFieldsFamilyState(scopeId))
        .filter((field) => field.isVisible)
        .sort((a, b) => a.position - b.position),
});
