import { type WorkflowActionType } from '@/workflow/types/Workflow';

type WorkflowIteratorStepConnectionOptions = {
  connectedStepType: Extract<WorkflowActionType, 'ITERATOR'>;
  settings: {
    isConnectedToLoop: boolean;
  };
};

export type WorkflowStepConnectionOptions =
  WorkflowIteratorStepConnectionOptions;
