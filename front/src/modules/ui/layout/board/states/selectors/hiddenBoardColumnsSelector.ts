import { selector } from 'recoil';

import { boardColumnsState } from '../boardColumnsState';

export const hiddenBoardColumnsSelector = selector({
  key: 'hiddenBoardColumnsScopedSelector',
  get: ({ get }) => get(boardColumnsState).filter((field) => !field.isVisible),
});
