import { createSelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorScopeMap';

import { recordBoardCardFieldsScopedState } from '../recordBoardDeprecatedCardFieldsScopedState';

export const visibleRecordBoardDeprecatedCardFieldsScopedSelector =
  createSelectorScopeMap({
    key: 'visibleRecordBoardDeprecatedCardFieldsScopedSelector',
    get:
      ({ scopeId }) =>
      ({ get }) =>
        get(recordBoardCardFieldsScopedState({ scopeId }))
          .filter((field) => field.isVisible)
          .sort((a, b) => a.position - b.position),
  });
