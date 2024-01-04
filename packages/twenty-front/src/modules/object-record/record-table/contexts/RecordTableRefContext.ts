import { createContext, RefObject } from 'react';

export const RecordTableRefContext = createContext<RefObject<HTMLTableElement>>(
  {
    current: null,
  },
);
