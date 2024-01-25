import { createContext } from 'react';

import { RecordBoardColumnDefinition } from '@/object-record/record-board/types/RecordBoardColumnDefinition';

type RecordBoardColumnContextProps = {
  columnDefinition: RecordBoardColumnDefinition;
  isColumnFirst: boolean;
  isColumnLast: boolean;
};

export const RecordBoardColumnContext =
  createContext<RecordBoardColumnContextProps>(
    {} as RecordBoardColumnContextProps,
  );
