import { createContext } from 'react';

import { BoardColumnDefinition } from '../types/BoardColumnDefinition';

type BoardColumnContextProps = {
  id: string;
  columnDefinition: BoardColumnDefinition;
  isFirstColumn: boolean;
  isLastColumn: boolean;
  onTitleEdit: (params: { title: string; color: string }) => void;
};

export const BoardColumnContext = createContext<BoardColumnContextProps | null>(
  null,
);
