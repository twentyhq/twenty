import { type Key } from 'react';
import { type DataGridProps } from 'react-data-grid';

export type SpreadsheetImportTableProps<
  TData,
  TRowKey extends Key = Key,
> = Pick<
  DataGridProps<TData, unknown, TRowKey>,
  | 'columns'
  | 'headerRowHeight'
  | 'rows'
  | 'onCellClick'
  | 'renderers'
  | 'onRowsChange'
> & {
  className?: string;
  rowHeight?: number;
  hiddenHeader?: boolean;
} & (
    | {
        selectionMode: 'single';
        selectionLabel: string;
        rowKeyGetter: (row: TData) => TRowKey;
        selectedRowKey: TRowKey;
        onSelectedRowChange: (rowKey: TRowKey) => void;
        selectedRows?: never;
        onSelectedRowsChange?: never;
      }
    | (Pick<
        DataGridProps<TData, unknown, TRowKey>,
        'rowKeyGetter' | 'selectedRows' | 'onSelectedRowsChange'
      > & {
        selectionMode?: 'multiple';
      })
  );
