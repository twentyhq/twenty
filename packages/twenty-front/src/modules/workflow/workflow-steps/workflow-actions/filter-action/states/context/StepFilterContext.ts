import { createContext } from 'react';
import { StepFilter, StepFilterGroup } from 'twenty-shared/src/types';

type StepFilterContextType = {
  readonly?: boolean;
  upsertStepFilterGroup?: (stepFilterGroup: StepFilterGroup) => void;
  upsertStepFilter?: (stepFilter: StepFilter) => void;
  deleteStepFilter?: (stepFilterId: string) => void;
  deleteStepFilterGroup?: (stepFilterGroupId: string) => void;
};

export const StepFilterContext = createContext<StepFilterContextType>(
  {} as StepFilterContextType,
);
