import { createContext } from 'react';

import { BoardOptions } from '@/ui/layout/board/types/BoardOptions';

type BoardOptionsContextType = BoardOptions & {
  handleEditColumnTitle: (
    columnId: string,
    title: string,
    color: string,
  ) => void;
  handleDeleteColumn: (boardColumnId: string) => void;
};

export const BoardOptionsContext =
  createContext<BoardOptionsContextType | null>(null);
