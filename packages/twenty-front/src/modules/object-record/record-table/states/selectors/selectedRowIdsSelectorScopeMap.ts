import { createSelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorScopeMap';

import { isRowSelectedFamilyStateScopeMap } from '../../record-table-row/states/isRowSelectedFamilyStateScopeMap';
import { tableRowIdsStateScopeMap } from '../tableRowIdsStateScopeMap';

export const selectedRowIdsSelectorScopeMap = createSelectorScopeMap<string[]>({
  key: 'selectedRowIdsSelectorScopeMap',
  get:
    ({ scopeId }) =>
    ({ get }) => {
      const rowIds = get(tableRowIdsStateScopeMap({ scopeId }));

      return rowIds.filter(
        (rowId) =>
          get(
            isRowSelectedFamilyStateScopeMap({
              scopeId,
              familyKey: rowId,
            }),
          ) === true,
      );
    },
});
