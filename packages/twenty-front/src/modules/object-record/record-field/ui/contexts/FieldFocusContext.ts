import { createContext } from 'react';

export type FieldFocusContextType = {
  isFocused: boolean;
  setIsFocused: (isFocused: boolean) => void;
};

export const FieldFocusContext = createContext<FieldFocusContextType>(
  {} as FieldFocusContextType,
);
