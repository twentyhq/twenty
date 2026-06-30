import { createContext } from 'react';

export type SetEditableFocused = (focused: boolean) => void;

export const FrontComponentInputFocusContext =
  createContext<SetEditableFocused | null>(null);
