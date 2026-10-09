import { createContext } from 'react';

export const SelectableListNativeItemRefsContext = createContext<
  Map<string, HTMLElement> | undefined
>(undefined);
