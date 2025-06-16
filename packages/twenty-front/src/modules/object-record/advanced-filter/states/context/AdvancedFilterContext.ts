import { createContext } from 'react';

type AdvancedFilterContextType = {
  onUpdate?: () => void;
  isWorkflowFindRecords?: boolean;
};

export const AdvancedFilterContext = createContext<AdvancedFilterContextType>(
  {} as AdvancedFilterContextType,
);
