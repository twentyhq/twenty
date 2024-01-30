import { createSelectorReadOnlyScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorReadOnlyScopeMap';

import { recordBoardCardFieldsScopedState } from '../recordBoardDeprecatedCardFieldsScopedState';

export const visibleRecordBoardDeprecatedCardFieldsScopedSelector =
  createSelectorReadOnlyScopeMap({
    key: 'visibleRecordBoardDeprecatedCardFieldsScopedSelector',
    get:
      ({ scopeId }) =>
      ({ get }) =>
        get(recordBoardCardFieldsScopedState({ scopeId }))
          .filter((field) => field.isVisible)
          .sort((a, b) => a.position - b.position),
  });
