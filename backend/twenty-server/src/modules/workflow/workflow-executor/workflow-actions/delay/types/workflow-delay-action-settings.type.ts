import { type WorkflowDelayActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/types/workflow-delay-action-input.type';
import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowDelayActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowDelayActionInput;
};
