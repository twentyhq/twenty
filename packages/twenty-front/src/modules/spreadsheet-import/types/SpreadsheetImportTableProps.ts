import { type Key } from 'react';
import { type DataGridProps } from 'react-data-grid';

export type SpreadsheetImportTableProps<
  TData,
  TRowKey extends Key = Key,
> = Pick<
  DataGridProps<TData, unknown, TRowKey>,
  | 'className'
  | 'columns'
  | 'headerRowHeight'
  | 'rows'
  | 'rowKeyGetter'
  | 'onCellClick'
  | 'onSelectedCellChange'
  | 'renderers'
  | 'onRowsChange'
  | 'selectedRows'
  | 'onSelectedRowsChange'
>;
