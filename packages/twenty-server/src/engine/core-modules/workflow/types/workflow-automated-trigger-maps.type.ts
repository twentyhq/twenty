import { type AutomatedTriggerType } from 'src/engine/core-modules/workflow/enums/automated-trigger-type.enum';
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
