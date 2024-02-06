import { availableTableColumnKeysSelectorScopeMap } from '@/object-record/record-table/states/selectors/availableTableColumnKeysSelectorScopeMap';
import { tableLabelIdentifierColumnSelectorScopeMap } from '@/object-record/record-table/states/selectors/tableLabelIdentifierColumnSelectorScopeMap';
import { tableColumnsStateScopeMap } from '@/object-record/record-table/states/tableColumnsStateScopeMap';
import { createSelectorReadOnlyScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorReadOnlyScopeMap';

export const visibleTableColumnsSelectorScopeMap =
  createSelectorReadOnlyScopeMap({
    key: 'visibleTableColumnsSelectorScopeMap',
    get:
      ({ scopeId }) =>
      ({ get }) => {
        const columns = get(tableColumnsStateScopeMap({ scopeId }));
        const availableColumnKeys = get(
          availableTableColumnKeysSelectorScopeMap({ scopeId }),
        );
        const labelIdentifierColumn = get(
          tableLabelIdentifierColumnSelectorScopeMap({ scopeId }),
        );

        const sortedVisibleColumns = columns
          .filter(
            (column) =>
              column.isVisible &&
              column.fieldMetadataId !==
                labelIdentifierColumn?.fieldMetadataId &&
              availableColumnKeys.includes(column.fieldMetadataId),
          )
          .sort((columnA, columnB) => columnA.position - columnB.position);

        return labelIdentifierColumn
          ? [
              { ...labelIdentifierColumn, isVisible: true },
              ...sortedVisibleColumns,
            ]
          : sortedVisibleColumns;
      },
  });
