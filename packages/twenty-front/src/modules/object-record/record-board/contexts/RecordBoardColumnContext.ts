import { createContext } from 'react';

import { BoardColumnDefinition } from '@/object-record/record-board-deprecated/types/BoardColumnDefinition';

type RecordBoardColumnContextProps = {
  id: string;
  columnDefinition: BoardColumnDefinition;
};

export const RecordBoardColumnContext =
  createContext<RecordBoardColumnContextProps | null>(null);
