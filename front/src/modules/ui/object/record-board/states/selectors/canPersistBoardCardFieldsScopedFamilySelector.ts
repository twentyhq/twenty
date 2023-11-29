import { selectorFamily } from 'recoil';

import { boardCardFieldsFamilyState } from '@/ui/object/record-board/states/boardCardFieldsFamilyState';
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
        get(boardCardFieldsFamilyState(recoilScopeId)),
      ),
});
