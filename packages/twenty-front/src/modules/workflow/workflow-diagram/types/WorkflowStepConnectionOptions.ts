import { type WorkflowActionType } from '@/workflow/types/Workflow';

type WorkflowIteratorStepConnectionOptions = {
  connectedStepType: Extract<WorkflowActionType, 'ITERATOR'>;
  settings: {
    isConnectedToLoop: boolean;
  };
};

type WorkflowIfElseStepConnectionOptions = {
  connectedStepType: Extract<WorkflowActionType, 'IF_ELSE'>;
  settings: {
    branchId: string;
  };
};

export type WorkflowStepConnectionOptions =
  | WorkflowIteratorStepConnectionOptions
  | WorkflowIfElseStepConnectionOptions;
