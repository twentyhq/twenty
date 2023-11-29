import { selectorFamily } from 'recoil';

import { boardCardFieldsScopedFamilyState } from '@/ui/object/record-board/states/boardCardFieldsScopedFamilyState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

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
        get(boardCardFieldsScopedFamilyState(recoilScopeId)),
      ),
});
