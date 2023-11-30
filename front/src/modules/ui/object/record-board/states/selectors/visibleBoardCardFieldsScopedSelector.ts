import { createScopedSelector } from '@/ui/utilities/recoil-scope/utils/createScopedSelector';

import { boardCardFieldsFamilyState } from '../boardCardFieldsFamilyState';

export const visibleBoardCardFieldsScopedSelector = createScopedSelector({
  key: 'visibleBoardCardFieldsScopedSelector',
  get:
    ({ scopeId }) =>
    ({ get }) =>
      get(boardCardFieldsFamilyState(scopeId))
        .filter((field) => field.isVisible)
        .sort((a, b) => a.position - b.position),
});
