import { createContext } from 'react';

export const FormFieldEscapeContext = createContext<(() => void) | undefined>(
  undefined,
);
