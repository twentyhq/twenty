import { createContext } from 'react';

export const DragDropColumnSortableHandleRefContext = createContext<
  ((element: Element | null) => void) | undefined
>(undefined);
