import { availableTableColumnsStateScopeMap } from '@/object-record/record-table/states/availableTableColumnsStateScopeMap';
import { createSelectorReadOnlyScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorReadOnlyScopeMap';

import { tableColumnsStateScopeMap } from '../tableColumnsStateScopeMap';

export const visibleTableColumnsSelectorScopeMap =
  createSelectorReadOnlyScopeMap({
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
