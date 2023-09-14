import { selectorFamily } from 'recoil';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { boardCardFieldsScopedState } from '../boardCardFieldsScopedState';
import { savedBoardCardFieldsFamilyState } from '../savedBoardCardFieldsFamilyState';

export const canPersistBoardCardFieldsScopedFamilySelector = selectorFamily({
  key: 'canPersistBoardCardFieldsScopedFamilySelector',
  get:
    ([scopeId, viewId]: [string, string | undefined]) =>
    ({ get }) =>
      !isDeeplyEqual(
        get(savedBoardCardFieldsFamilyState(viewId)),
        get(boardCardFieldsScopedState(scopeId)),
      ),
});
