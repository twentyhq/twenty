import { createContext } from 'react';

import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

export type RecordTableCellContextValue = {
  recordField: RecordField;
  cellPosition: TableCellPosition;
};

export const RecordTableCellContext =
  createContext<RecordTableCellContextValue>({} as RecordTableCellContextValue);
