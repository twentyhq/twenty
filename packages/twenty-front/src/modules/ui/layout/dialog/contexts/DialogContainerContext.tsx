import { createContext } from 'react';

type DialogContainerContextValue = {
  container: HTMLElement | null;
};

export const DialogContainerContext =
  createContext<DialogContainerContextValue>({ container: null });
