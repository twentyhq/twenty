import { type AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { type AutomatedTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';

// Denormalized automated trigger derived from the active workflow version's
// `trigger`. Replaces the workspace `workflowAutomatedTrigger` index that
// CRON/DATABASE_EVENT dispatch used to read.
export type CachedWorkflowAutomatedTrigger = {
  workflowId: string;
  workflowVersionId: string;
  type: AutomatedTriggerType;
  settings: AutomatedTriggerSettings;
};

// A workflow has at most one ACTIVE version, and that version has at most one
// automated trigger, so keying by workflowId is sufficient.
export type WorkflowAutomatedTriggerMaps = {
  byWorkflowId: Record<string, CachedWorkflowAutomatedTrigger>;
};
