import { selector } from 'recoil';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { boardColumnsState } from '../boardColumnsState';
import { savedBoardColumnsState } from '../savedBoardColumnsState';

export const canPersistBoardColumnsSelector = selector<boolean>({
  key: 'canPersistBoardCardFieldsScopedFamilySelector',
  get: ({ get }) =>
    !isDeeplyEqual(get(boardColumnsState), get(savedBoardColumnsState)),
});
