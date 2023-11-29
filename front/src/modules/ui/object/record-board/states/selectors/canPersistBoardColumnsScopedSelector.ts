import { boardColumnsScopedState } from '@/ui/object/record-board/states/boardColumnsScopedState';
import { createScopedSelector } from '@/ui/utilities/recoil-scope/utils/createScopedSelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { savedBoardColumnsScopedState } from '../savedBoardColumnsScopedState';

export const canPersistBoardColumnsScopedSelector =
  createScopedSelector<boolean>({
    key: 'canPersistBoardCardFieldsScopedFamilySelector',
    get:
      ({ scopeId }) =>
      ({ get }) =>
        !isDeeplyEqual(
          get(boardColumnsScopedState({ scopeId })),
          get(savedBoardColumnsScopedState),
        ),
  });
