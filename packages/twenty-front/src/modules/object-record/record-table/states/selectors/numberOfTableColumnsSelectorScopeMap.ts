import { createSelectorReadOnlyScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorReadOnlyScopeMap';

import { tableColumnsStateScopeMap } from '../tableColumnsStateScopeMap';

export const numberOfTableColumnsSelectorScopeMap =
  createSelectorReadOnlyScopeMap({
    key: 'numberOfTableColumnsSelectorScopeMap',
    get:
      ({ scopeId }) =>
      ({ get }) =>
        get(tableColumnsStateScopeMap({ scopeId })).length,
  });
