import { createContext } from 'react';

export const DragDropItemSortableHandleRefContext = createContext<
  ((element: Element | null) => void) | undefined
>(undefined);
