import { createContext } from 'react';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

type RecordTableRowContextProps = {
  columnDefinition: ColumnDefinition<FieldMetadata>;
  columnIndex: number;
};

export const RecordTableCellContext = createContext<RecordTableRowContextProps>(
  {} as RecordTableRowContextProps,
);
