import { createContext } from 'react';

type RecordBoardCardContextProps = {
  recordId: string;
};

export const RecordBoardCardContext =
  createContext<RecordBoardCardContextProps>({} as RecordBoardCardContextProps);
