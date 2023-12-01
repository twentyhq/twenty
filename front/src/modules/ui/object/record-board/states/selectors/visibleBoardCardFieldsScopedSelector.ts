import { createScopedSelector } from '@/ui/utilities/recoil-scope/utils/createScopedSelector';

import { boardCardFieldsScopedState } from '../boardCardFieldsScopedState';

export const visibleBoardCardFieldsScopedSelector = createScopedSelector({
  key: 'visibleBoardCardFieldsScopedSelector',
  get:
    ({ scopeId }) =>
    ({ get }) =>
      get(boardCardFieldsScopedState({ scopeId }))
        .filter((field) => field.isVisible)
        .sort((a, b) => a.position - b.position),
});
