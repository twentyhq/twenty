import { selectorFamily } from 'recoil';

import { boardColumnsState } from '../boardColumnsState';

export const hiddenBoardColumnsScopedSelector = selectorFamily({
  key: 'hiddenBoardColumnsScopedSelector',
  get:
    (scopeId: string) =>
    ({ get }) =>
      get(boardColumnsState).filter((field) => !field.isVisible),
});
