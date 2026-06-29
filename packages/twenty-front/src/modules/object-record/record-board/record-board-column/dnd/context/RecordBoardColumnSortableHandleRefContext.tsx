import { createContext } from 'react';

export const RecordBoardColumnSortableHandleRefContext = createContext<
  ((element: Element | null) => void) | undefined
>(undefined);
