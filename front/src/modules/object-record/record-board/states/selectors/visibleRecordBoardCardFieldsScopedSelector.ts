import { createScopedSelector } from '@/ui/utilities/recoil-scope/utils/createScopedSelector';

import { recordBoardCardFieldsScopedState } from '../recordBoardCardFieldsScopedState';

export const visibleRecordBoardCardFieldsScopedSelector = createScopedSelector({
  key: 'visibleRecordBoardCardFieldsScopedSelector',
  get:
    ({ scopeId }) =>
    ({ get }) =>
      get(recordBoardCardFieldsScopedState({ scopeId }))
        .filter((field) => field.isVisible)
        .sort((a, b) => a.position - b.position),
});
