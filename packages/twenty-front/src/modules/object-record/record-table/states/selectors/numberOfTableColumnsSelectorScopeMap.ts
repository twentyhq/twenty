import { createSelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorScopeMap';

import { tableColumnsStateScopeMap } from '../tableColumnsStateScopeMap';

export const numberOfTableColumnsSelectorScopeMap = createSelectorScopeMap({
  key: 'numberOfTableColumnsSelectorScopeMap',
  get:
    ({ scopeId }) =>
    ({ get }) =>
      get(tableColumnsStateScopeMap({ scopeId })).length,
});
