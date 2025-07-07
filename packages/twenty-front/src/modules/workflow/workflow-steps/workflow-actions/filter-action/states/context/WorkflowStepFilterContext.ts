import { createContext } from 'react';
import { StepFilter, StepFilterGroup } from 'twenty-shared/src/types';

type WorkflowStepFilterContextType = {
  readonly?: boolean;
  upsertStepFilterSettings: ({
    stepFilterGroupToUpsert,
    stepFilterToUpsert,
  }: {
    stepFilterGroupToUpsert?: StepFilterGroup;
    stepFilterToUpsert?: StepFilter;
  }) => void;
  deleteStepFilter: (stepFilterId: string) => void;
  deleteStepFilterGroup: (stepFilterGroupId: string) => void;
};

export const WorkflowStepFilterContext =
  createContext<WorkflowStepFilterContextType>(
    {} as WorkflowStepFilterContextType,
  );
