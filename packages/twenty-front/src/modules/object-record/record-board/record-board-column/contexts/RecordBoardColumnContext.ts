import { createContext } from 'react';

import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';

type RecordBoardColumnContextProps = {
  columnDefinition: RecordGroupDefinition;
  isFirstColumn: boolean;
  isLastColumn: boolean;
  recordCount: number;
};

export const RecordBoardColumnContext =
  createContext<RecordBoardColumnContextProps>(
    {} as RecordBoardColumnContextProps,
  );
