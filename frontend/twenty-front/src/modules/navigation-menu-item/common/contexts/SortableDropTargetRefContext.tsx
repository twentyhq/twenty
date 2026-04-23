import { createContext } from 'react';

export const SortableDropTargetRefContext = createContext<
  ((element: Element | null) => void) | null
>(null);
