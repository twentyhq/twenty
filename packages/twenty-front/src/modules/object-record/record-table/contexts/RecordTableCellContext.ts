import { createContext } from 'react';

import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

export type RecordTableCellContextValue = {
  columnDefinition: ColumnDefinition<FieldMetadata>;
  cellPosition: TableCellPosition;
};

export const RecordTableCellContext =
  createContext<RecordTableCellContextValue>({} as RecordTableCellContextValue);
