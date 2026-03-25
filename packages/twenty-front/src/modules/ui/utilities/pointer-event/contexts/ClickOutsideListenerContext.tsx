import { createContext } from 'react';

type ClickOutsideListenerContextType = {
  excludedClickOutsideId: string | undefined;
};

export const ClickOutsideListenerContext =
  createContext<ClickOutsideListenerContextType>({
    excludedClickOutsideId: undefined,
  });
