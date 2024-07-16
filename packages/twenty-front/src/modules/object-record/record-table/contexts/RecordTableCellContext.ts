import { createContext } from 'react';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

export type RecordTableCellContextProps = {
  columnDefinition: ColumnDefinition<FieldMetadata>;
  columnIndex: number;
  isInEditMode: boolean;
  hasSoftFocus: boolean;
  cellPosition: TableCellPosition;
};

export const RecordTableCellContext =
  createContext<RecordTableCellContextProps>({} as RecordTableCellContextProps);
