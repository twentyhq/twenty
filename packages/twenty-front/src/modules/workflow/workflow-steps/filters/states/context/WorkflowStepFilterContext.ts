import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import { createContext, type ComponentType } from 'react';
import { type StepFilter } from 'twenty-shared/types';

export type StepFilterCellComponent = ComponentType<{ stepFilter: StepFilter }>;

type WorkflowStepFilterContextType = {
  stepId: string;
  onFilterSettingsUpdate: (
    filterSettings: FilterSettings,
  ) => void | Promise<void>;
  readonly?: boolean;
  FieldSelectComponent?: StepFilterCellComponent;
  ValueInputComponent?: StepFilterCellComponent;
  canAddFilterGroups?: boolean;
};

export const WorkflowStepFilterContext =
  createContext<WorkflowStepFilterContextType>(
    {} as WorkflowStepFilterContextType,
  );
