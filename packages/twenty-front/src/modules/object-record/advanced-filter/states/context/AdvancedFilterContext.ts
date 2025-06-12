import { createContext } from 'react';

type AdvancedFilterContextType = {
  onUpdate?: () => void;
  isColumn?: boolean;
};

export const AdvancedFilterContext = createContext<AdvancedFilterContextType>(
  {} as AdvancedFilterContextType,
);
