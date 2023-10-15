import { createContext } from 'react';

import { BoardColumnDefinition } from '../types/BoardColumnDefinition';

type BoardColumn = {
  id: string;
  columnDefinition: BoardColumnDefinition;
  isFirstColumn: boolean;
  isLastColumn: boolean;
  primaryColumnKey: string;
};

export const BoardColumnContext = createContext<BoardColumn | null>(null);
