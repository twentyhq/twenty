import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowIteratorActionInput = {
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  items?: Array<any> | string;
  initialLoopStepIds?: string[];
  shouldContinueOnIterationFailure?: boolean;
};

export type WorkflowIteratorActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowIteratorActionInput;
};
