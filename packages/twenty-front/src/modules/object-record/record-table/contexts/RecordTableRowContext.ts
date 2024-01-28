import { createContext } from 'react';

type RecordTableRowContextProps = {
  pathToShowPage: string;
  recordId: string;
  rowIndex: number;
};

export const RecordTableRowContext = createContext<RecordTableRowContextProps>(
  {} as RecordTableRowContextProps,
);
