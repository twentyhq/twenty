import { createContext } from 'react';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

export type RecordTableCellContextValue = {
  columnDefinition: ColumnDefinition<FieldMetadata>;
  cellPosition: TableCellPosition;
  handleActivateRecordTableRow?: () => void;
};

export const RecordTableCellContext =
  createContext<RecordTableCellContextValue>({} as RecordTableCellContextValue);
