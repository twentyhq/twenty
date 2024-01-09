import { createSelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorScopeMap';

import { availableTableColumnsScopedState } from '../availableTableColumnsScopedState';
import { tableColumnsScopedState } from '../tableColumnsScopedState';

export const visibleTableColumnsScopedSelector = createSelectorScopeMap({
  key: 'visibleTableColumnsScopedSelector',
  get:
    ({ scopeId }) =>
    ({ get }) => {
      const columns = get(tableColumnsScopedState({ scopeId }));
      const availableColumnKeys = get(
        availableTableColumnsScopedState({ scopeId }),
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
