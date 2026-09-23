import { createContext } from 'react';

export const DropdownRootContext = createContext<{
  isOpen: boolean;
  closeDropdown: () => void;
} | null>(null);
