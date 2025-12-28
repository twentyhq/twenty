import { type FilterSettings } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowEditActionFilter';
import { createContext } from 'react';

type WorkflowStepFilterContextType = {
  stepId: string;
  onFilterSettingsUpdate: (filterSettings: FilterSettings) => void;
  readonly?: boolean;
  firstFilterLabel?: string;
};

export const WorkflowStepFilterContext =
  createContext<WorkflowStepFilterContextType>(
    {} as WorkflowStepFilterContextType,
  );
