import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  CoreObjectTableBody,
  CoreObjectTableRow,
} from '@/object-core/components/CoreObjectTableRow';
import { type CoreObjectTableColumn } from '@/object-core/types/CoreObjectTableColumn';
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
}: CoreObjectTableProps<TItem>) => {
  const { t } = useLingui();

  const gridTemplateColumns = columns
    .map((column) => column.gridTrack)
    .join(' ');

  return (
    <Table>
      <TableRow gridTemplateColumns={gridTemplateColumns}>
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
        {items.map((item) => (
          <CoreObjectTableRow
            key={getItemKey(item)}
            gridTemplateColumns={gridTemplateColumns}
            to={getItemLink?.(item)}
          >
            {columns.map((column) => (
              <TableCell key={column.fieldName} align={column.align}>
                {column.renderCell(item)}
              </TableCell>
            ))}
          </CoreObjectTableRow>
        ))}
      </CoreObjectTableBody>
    </Table>
  );
};
