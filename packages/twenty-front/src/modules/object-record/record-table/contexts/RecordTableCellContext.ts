import { createContext } from 'react';

import { type RecordField } from '@/object-record/record-field/types/RecordField';

export type RecordTableCellContextValue = {
  recordField: RecordField;
  columnIndex: number;
};

export const RecordTableCellContext =
  createContext<RecordTableCellContextValue>({} as RecordTableCellContextValue);
