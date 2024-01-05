import { createSelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorScopeMap';

import { isRowSelectedScopedFamilyState } from '../../record-table-row/states/isRowSelectedScopedFamilyState';
import { tableRowIdsScopedState } from '../tableRowIdsScopedState';

export const selectedRowIdsScopedSelector = createSelectorScopeMap<string[]>({
  key: 'selectedRowIdsScopedSelector',
  get:
    ({ scopeId }) =>
    ({ get }) => {
      const rowIds = get(tableRowIdsScopedState({ scopeId }));

      return rowIds.filter(
        (rowId) =>
          get(
            isRowSelectedScopedFamilyState({
              scopeId,
              familyKey: rowId,
            }),
          ) === true,
      );
    },
});
