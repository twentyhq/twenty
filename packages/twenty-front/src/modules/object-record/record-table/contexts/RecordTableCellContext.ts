import { createContext } from 'react';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { FieldCellValue } from '@/object-record/record-table/states/fieldCellFamilyState';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

type RecordTableRowContextProps = {
  columnDefinition: ColumnDefinition<FieldMetadata>;
  columnIndex: number;
  fieldCellValue: FieldCellValue;
};

export const RecordTableCellContext = createContext<RecordTableRowContextProps>(
  {} as RecordTableRowContextProps,
);
