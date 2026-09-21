import { createContext } from 'react';

import { type SetEditableFocused } from '@/host/caret/types/SetEditableFocused';

export const FrontComponentInputFocusContext =
  createContext<SetEditableFocused | null>(null);
