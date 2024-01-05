import { createSelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorScopeMap';

import { recordBoardCardFieldsScopedState } from '../recordBoardCardFieldsScopedState';

export const visibleRecordBoardCardFieldsScopedSelector =
  createSelectorScopeMap({
    key: 'visibleRecordBoardCardFieldsScopedSelector',
    get:
      ({ scopeId }) =>
      ({ get }) =>
        get(recordBoardCardFieldsScopedState({ scopeId }))
          .filter((field) => field.isVisible)
          .sort((a, b) => a.position - b.position),
  });
