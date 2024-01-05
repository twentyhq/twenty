import { createSelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorScopeMap';

import { availableTableColumnsScopedState } from '../availableTableColumnsScopedState';
import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const hiddenTableColumnsScopedSelector = createSelectorScopeMap({
  key: 'hiddenTableColumnsScopedSelector',
  get:
    ({ scopeId }) =>
    ({ get }) => {
      const columns = get(tableColumnsScopedState({ scopeId }));
      const columnKeys = columns.map(({ fieldMetadataId }) => fieldMetadataId);
      const otherAvailableColumns = get(
        availableTableColumnsScopedState({ scopeId }),
      ).filter(({ fieldMetadataId }) => !columnKeys.includes(fieldMetadataId));

      return [
        ...columns.filter((column) => !column.isVisible),
        ...otherAvailableColumns,
      ];
    },
});
