import { createSelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorScopeMap';

import { availableTableColumnsStateScopeMap } from '../availableTableColumnsStateScopeMap';
import { tableColumnsStateScopeMap } from '../tableColumnsStateScopeMap';

export const visibleTableColumnsSelectorScopeMap = createSelectorScopeMap({
  key: 'visibleTableColumnsSelectorScopeMap',
  get:
    ({ scopeId }) =>
    ({ get }) => {
      const columns = get(tableColumnsStateScopeMap({ scopeId }));
      const availableColumnKeys = get(
        availableTableColumnsStateScopeMap({ scopeId }),
      ).map(({ fieldMetadataId }) => fieldMetadataId);

      return [...columns]
        .filter(
          (column) =>
            column.isVisible &&
            availableColumnKeys.includes(column.fieldMetadataId),
        )
        .sort((a, b) => a.position - b.position);
    },
});
