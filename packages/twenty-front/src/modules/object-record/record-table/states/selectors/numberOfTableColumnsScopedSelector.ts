import { createSelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorScopeMap';

import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const numberOfTableColumnsScopedSelector = createSelectorScopeMap({
  key: 'numberOfTableColumnsScopedSelector',
  get:
    ({ scopeId }) =>
    ({ get }) =>
      get(tableColumnsScopedState({ scopeId })).length,
});
