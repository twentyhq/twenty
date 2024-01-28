import { createContext } from 'react';

type RecordTableRowContextProps = {
  pathToShowPage: string;
  recordId: string;
  rowIndex: number;
  isSelected: boolean;
};

export const RecordTableRowContext = createContext<RecordTableRowContextProps>(
  {} as RecordTableRowContextProps,
);
