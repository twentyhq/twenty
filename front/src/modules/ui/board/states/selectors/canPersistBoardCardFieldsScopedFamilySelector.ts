import { selectorFamily } from 'recoil';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { boardCardFieldsScopedState } from '../boardCardFieldsScopedState';
import { savedBoardCardFieldsFamilyState } from '../savedBoardCardFieldsFamilyState';

export const canPersistBoardCardFieldsScopedFamilySelector = selectorFamily({
  key: 'canPersistBoardCardFieldsScopedFamilySelector',
  get:
    ({
      recoilScopeId,
      viewId,
    }: {
      recoilScopeId: string;
      viewId: string | undefined;
    }) =>
    ({ get }) =>
      !isDeeplyEqual(
        get(savedBoardCardFieldsFamilyState(viewId)),
        get(boardCardFieldsScopedState(recoilScopeId)),
      ),
});
