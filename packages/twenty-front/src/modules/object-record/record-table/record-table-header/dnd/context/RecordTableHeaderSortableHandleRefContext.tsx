import { createContext } from 'react';

export const RecordTableHeaderSortableHandleRefContext = createContext<
  ((element: Element | null) => void) | undefined
>(undefined);
