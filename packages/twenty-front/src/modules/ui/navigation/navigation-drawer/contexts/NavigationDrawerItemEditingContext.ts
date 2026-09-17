import { createContext, type ReactNode } from 'react';

export const NavigationDrawerItemEditingContext = createContext<{
  icon: ReactNode;
  label: ReactNode;
  isSelected: boolean;
} | null>(null);
