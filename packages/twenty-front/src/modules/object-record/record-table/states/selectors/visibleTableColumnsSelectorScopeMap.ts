import { tableColumnsStateScopeMap } from '@/object-record/record-table/states/tableColumnsStateScopeMap';
import { createSelectorReadOnlyScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorReadOnlyScopeMap';

export const visibleTableColumnsSelectorScopeMap =
  createSelectorReadOnlyScopeMap({
    key: 'visibleTableColumnsSelectorScopeMap',
    get:
      ({ scopeId }) =>
      ({ get }) => {
        const columns = get(tableColumnsStateScopeMap({ scopeId }));
        return columns
          .filter((column) => column.isVisible)
          .sort((columnA, columnB) => columnA.position - columnB.position);
      },
  });
