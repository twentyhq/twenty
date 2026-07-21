import { type AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { type AutomatedTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';

export type CachedWorkflowAutomatedTrigger = {
  workflowId: string;
  workflowVersionId: string;
  type: AutomatedTriggerType;
  settings: AutomatedTriggerSettings;
};

export type WorkflowAutomatedTriggerMaps = {
  byWorkflowId: Record<string, CachedWorkflowAutomatedTrigger>;
};
