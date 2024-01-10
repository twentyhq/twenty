import { createSelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorScopeMap';

import { availableTableColumnsStateScopeMap } from '../availableTableColumnsStateScopeMap';
import { tableColumnsStateScopeMap } from '../tableColumnsStateScopeMap';

export const hiddenTableColumnsSelectorScopeMap = createSelectorScopeMap({
  key: 'hiddenTableColumnsSelectorScopeMap',
  get:
    ({ scopeId }) =>
    ({ get }) => {
      const columns = get(tableColumnsStateScopeMap({ scopeId }));
      const columnKeys = columns.map(({ fieldMetadataId }) => fieldMetadataId);
      const otherAvailableColumns = get(
        availableTableColumnsStateScopeMap({ scopeId }),
      ).filter(({ fieldMetadataId }) => !columnKeys.includes(fieldMetadataId));

      return [
        ...columns.filter((column) => !column.isVisible),
        ...otherAvailableColumns,
      ];
    },
});
