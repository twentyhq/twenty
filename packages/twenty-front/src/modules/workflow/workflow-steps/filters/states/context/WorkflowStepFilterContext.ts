import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import { createContext } from 'react';

type WorkflowStepFilterContextType = {
  stepId: string;
  onFilterSettingsUpdate: (
    filterSettings: FilterSettings,
  ) => void | Promise<void>;
  readonly?: boolean;
};

export const WorkflowStepFilterContext =
  createContext<WorkflowStepFilterContextType>(
    {} as WorkflowStepFilterContextType,
  );
