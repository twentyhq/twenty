import { createContext } from 'react';

export const ParentClickOutsideIdContext = createContext<string | undefined>(
  undefined,
);
