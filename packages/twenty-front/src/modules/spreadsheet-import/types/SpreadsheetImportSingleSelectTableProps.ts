import { type SpreadsheetImportTableProps } from '@/spreadsheet-import/types/SpreadsheetImportTableProps';
import { type Key } from 'react';

export type SpreadsheetImportSingleSelectTableProps<
  TData,
  TRowKey extends Key = Key,
> = Pick<
  SpreadsheetImportTableProps<TData, TRowKey>,
  'className' | 'columns' | 'headerRowHeight' | 'rows'
> & {
  selectionLabel: string;
  rowKeyGetter: (row: TData) => TRowKey;
  selectedRowKey: TRowKey;
  onSelectedRowChange: (rowKey: TRowKey) => void;
};
