import { createContext } from 'react';

type RecordBoardCardContextProps = {
  recordId: string;
  isRecordReadOnly: boolean;
  rowIndex: number;
  columnIndex: number;
};

export const RecordBoardCardContext =
  createContext<RecordBoardCardContextProps>({} as RecordBoardCardContextProps);
