import { createContext } from 'react';

type ClickOutsideListenerContextType = {
  excludeClassName: string | undefined;
};

export const ClickOutsideListenerContext =
  createContext<ClickOutsideListenerContextType>({
    excludeClassName: undefined,
  });
