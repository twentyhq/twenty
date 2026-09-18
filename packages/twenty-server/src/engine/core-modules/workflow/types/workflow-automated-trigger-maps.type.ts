import { type AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { type AutomatedTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';

export type CoreDispatchIds =
  | { coreWorkflowVersionId: string; workspaceWorkflowVersionId?: string }
  | {
      coreWorkflowVersionId?: null;
      workspaceWorkflowVersionId?: string | null;
    };

export type CachedWorkflowAutomatedTrigger = {
  workflowId: string;
  legacyWorkflowId?: string;
  type: AutomatedTriggerType;
  settings: AutomatedTriggerSettings;
} & CoreDispatchIds;

export type WorkflowAutomatedTriggerMaps = {
  byWorkflowId: Record<string, CachedWorkflowAutomatedTrigger>;
};
