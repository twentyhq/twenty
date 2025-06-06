import { createContext } from 'react';

type AdvancedFilterContextType = {
  onUpdate?: () => void;
};

export const AdvancedFilterContext = createContext<AdvancedFilterContextType>(
  {} as AdvancedFilterContextType,
);
