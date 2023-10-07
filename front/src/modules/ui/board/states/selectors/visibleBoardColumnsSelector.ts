import { selector } from 'recoil';

import { boardColumnsState } from '../boardColumnsState';

export const visibleBoardColumnsSelector = selector({
  key: 'visibleBoardColumnsSelector',
  get: ({ get }) => get(boardColumnsState).filter((field) => field.isVisible),
});
