import { createContext } from 'react';

import { BoardOptions } from '@/ui/board/types/BoardOptions';

export const BoardOptionsContext = createContext<
  | (BoardOptions & {
      handleEditColumnTitle: (
        columnId: string,
        title: string,
        color: string,
      ) => void;
      handleDeleteColumn: (boardColumnId: string) => void;
    })
  | null
>(null);
