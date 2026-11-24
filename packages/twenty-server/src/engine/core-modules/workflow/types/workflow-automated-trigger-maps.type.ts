import { type AutomatedTriggerType } from 'src/engine/core-modules/workflow/enums/automated-trigger-type.enum';
import { type AutomatedTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';

export type CachedWorkflowAutomatedTrigger = {
  workflowId: string;
  coreWorkflowVersionId: string;
  applicationId: string;
  type: AutomatedTriggerType;
  settings: AutomatedTriggerSettings;
};

export type WorkflowAutomatedTriggerMaps = {
  byWorkflowId: Record<string, CachedWorkflowAutomatedTrigger>;
};
