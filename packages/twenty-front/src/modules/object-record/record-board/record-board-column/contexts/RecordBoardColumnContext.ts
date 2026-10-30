import { createContext } from 'react';

import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';

type RecordBoardColumnContextProps = {
  columnDefinition: RecordGroupDefinition;
  columnId: string;
  columnIndex: number;
};

export const RecordBoardColumnContext =
  createContext<RecordBoardColumnContextProps>(
    {} as RecordBoardColumnContextProps,
  );
