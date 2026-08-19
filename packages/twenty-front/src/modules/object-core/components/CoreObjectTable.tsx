import { type ReactNode } from 'react';
import { useLingui } from '@lingui/react/macro';

import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { type TableMetadata } from '@/ui/layout/table/types/TableMetadata';

type CoreObjectTableProps<TItem> = {
  items: TItem[];
  tableMetadata: TableMetadata<TItem>;
  gridTemplateColumns: string;
  renderRow: (item: TItem) => ReactNode;
};

export const CoreObjectTable = <TItem,>({
  items,
  tableMetadata,
  gridTemplateColumns,
  renderRow,
}: CoreObjectTableProps<TItem>) => {
  const { t } = useLingui();

  const sortedItems = useSortedArray(items, tableMetadata);

  return (
    <Table>
      <TableRow gridTemplateColumns={gridTemplateColumns}>
        {tableMetadata.fields.map((field) => (
          <SortableTableHeader
            key={String(field.fieldName)}
            fieldName={String(field.fieldName)}
            label={t(field.fieldLabel)}
            tableId={tableMetadata.tableId}
            initialSort={tableMetadata.initialSort}
            align={field.align}
            Icon={field.FieldIcon}
          />
        ))}
      </TableRow>
      <TableBody>{sortedItems.map(renderRow)}</TableBody>
    </Table>
  );
};
