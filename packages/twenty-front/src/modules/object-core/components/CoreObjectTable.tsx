import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  CoreObjectTableBody,
  CoreObjectTableRow,
} from '@/object-core/components/CoreObjectTableRow';
import { CoreObjectTableCheckboxCell } from '@/object-core/components/CoreObjectTableCheckboxCell';
import { CORE_OBJECT_TABLE_CHECKBOX_COLUMN_GRID_TRACK } from '@/object-core/constants/CoreObjectTableCheckboxColumnGridTrack';
import { type CoreObjectTableColumn } from '@/object-core/types/CoreObjectTableColumn';
import { type CoreObjectTableSelection } from '@/object-core/types/CoreObjectTableSelection';
import { getCoreObjectTableSelectionStatus } from '@/object-core/utils/getCoreObjectTableSelectionStatus';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableHeaderText } from '@/ui/layout/table/components/TableHeaderText';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type TableFieldMetadata } from '@/ui/layout/table/types/TableFieldMetadata';
import { type TableMetadata } from '@/ui/layout/table/types/TableMetadata';

type CoreObjectTableProps<TItem> = {
  tableId: string;
  columns: CoreObjectTableColumn<TItem>[];
  items: TItem[];
  getItemKey: (item: TItem) => string;
  getItemLink?: (item: TItem) => string | undefined;
  initialSort?: TableMetadata<TItem>['initialSort'];
  selection?: CoreObjectTableSelection<TItem>;
};

const isSortableColumn = <TItem,>(
  column: CoreObjectTableColumn<TItem>,
): column is CoreObjectTableColumn<TItem> & TableFieldMetadata<TItem> =>
  isDefined(column.fieldType);

export const CoreObjectTable = <TItem,>({
  tableId,
  columns,
  items,
  getItemKey,
  getItemLink,
  initialSort,
  selection,
}: CoreObjectTableProps<TItem>) => {
  const { t } = useLingui();

  const isSelectable = isDefined(selection);

  const selectableRowIds = isSelectable
    ? items
        .filter((item) => selection.isItemSelectable?.(item) ?? true)
        .map(getItemKey)
    : [];

  const { areAllRowsSelected, areSomeRowsSelected } =
    getCoreObjectTableSelectionStatus({
      rowIds: selectableRowIds,
      selectedRowIds: selection?.selectedRowIds ?? [],
    });

  const gridTemplateColumns = [
    ...(isSelectable ? [CORE_OBJECT_TABLE_CHECKBOX_COLUMN_GRID_TRACK] : []),
    ...columns.map((column) => column.gridTrack),
  ].join(' ');

  return (
    <Table>
      <TableRow gridTemplateColumns={gridTemplateColumns}>
        {isSelectable && (
          <TableHeader align="center" padding="0">
            <CoreObjectTableCheckboxCell
              checked={areAllRowsSelected || areSomeRowsSelected}
              indeterminate={areSomeRowsSelected}
              ariaLabel={t`Select all loaded rows`}
              onToggle={() =>
                selection.onToggleAllRows(
                  areAllRowsSelected ? [] : selectableRowIds,
                )
              }
            />
          </TableHeader>
        )}
        {columns.map((column) =>
          isSortableColumn(column) ? (
            <SortableTableHeader
              key={column.fieldName}
              tableId={tableId}
              fieldName={column.fieldName}
              label={t(column.fieldLabel)}
              align={column.align}
              initialSort={initialSort}
              Icon={column.FieldIcon}
            />
          ) : (
            <TableHeader key={column.fieldName} align={column.align}>
              {isDefined(column.FieldIcon) && <column.FieldIcon size={14} />}
              <TableHeaderText>{t(column.fieldLabel)}</TableHeaderText>
            </TableHeader>
          ),
        )}
      </TableRow>
      <CoreObjectTableBody>
        {items.map((item) => {
          const rowId = getItemKey(item);

          return (
            <CoreObjectTableRow
              key={rowId}
              gridTemplateColumns={gridTemplateColumns}
              to={getItemLink?.(item)}
            >
              {isSelectable && (
                <TableCell align="center" padding="0">
                  {(selection.isItemSelectable?.(item) ?? true) && (
                    <CoreObjectTableCheckboxCell
                      checked={selection.selectedRowIds.includes(rowId)}
                      ariaLabel={t`Select row`}
                      onToggle={() => selection.onToggleRow(rowId)}
                    />
                  )}
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column.fieldName} align={column.align}>
                  {column.renderCell(item)}
                </TableCell>
              ))}
            </CoreObjectTableRow>
          );
        })}
      </CoreObjectTableBody>
    </Table>
  );
};
