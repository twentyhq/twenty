import { createContext } from 'react';

type RecordBoardCardContextProps = {
  recordId: string;
  isRecordReadOnly: boolean;
};

export const RecordBoardCardContext =
  createContext<RecordBoardCardContextProps>({} as RecordBoardCardContextProps);
