import {
  workflowAiAgentActionSchema,
  workflowCodeActionSchema,
  workflowCreateRecordActionSchema,
  workflowCronTriggerSchema,
  workflowDatabaseEventTriggerSchema,
  workflowDeleteRecordActionSchema,
  workflowFilterActionSchema,
  workflowFindRecordsActionSchema,
  workflowFormActionSchema,
  workflowHttpRequestActionSchema,
  workflowManualTriggerSchema,
  workflowRunSchema,
  workflowRunStateSchema,
  workflowRunStatusSchema,
  workflowRunStepStatusSchema,
  workflowSendEmailActionSchema,
  workflowTriggerSchema,
  workflowUpdateRecordActionSchema,
  workflowWebhookTriggerSchema,
} from '@/workflow/validation-schemas/workflowSchema';
import { z } from 'zod';

export type WorkflowCodeAction = z.infer<typeof workflowCodeActionSchema>;
export type WorkflowSendEmailAction = z.infer<
  typeof workflowSendEmailActionSchema
>;
export type WorkflowCreateRecordAction = z.infer<
  typeof workflowCreateRecordActionSchema
>;
export type WorkflowUpdateRecordAction = z.infer<
  typeof workflowUpdateRecordActionSchema
>;
export type WorkflowDeleteRecordAction = z.infer<
  typeof workflowDeleteRecordActionSchema
>;
export type WorkflowFindRecordsAction = z.infer<
  typeof workflowFindRecordsActionSchema
>;
export type WorkflowFilterAction = z.infer<typeof workflowFilterActionSchema>;
export type WorkflowFormAction = z.infer<typeof workflowFormActionSchema>;
export type WorkflowHttpRequestAction = z.infer<
  typeof workflowHttpRequestActionSchema
>;

export type WorkflowAiAgentAction = z.infer<typeof workflowAiAgentActionSchema>;

export type WorkflowAction =
  | WorkflowCodeAction
  | WorkflowSendEmailAction
  | WorkflowCreateRecordAction
  | WorkflowUpdateRecordAction
  | WorkflowDeleteRecordAction
  | WorkflowFindRecordsAction
  | WorkflowFilterAction
  | WorkflowFormAction
  | WorkflowHttpRequestAction
  | WorkflowAiAgentAction;

export type WorkflowActionType = WorkflowAction['type'];
export type WorkflowStep = WorkflowAction;
export type WorkflowStepType = WorkflowStep['type'];

export type WorkflowDatabaseEventTrigger = z.infer<
  typeof workflowDatabaseEventTriggerSchema
>;
export type WorkflowManualTrigger = z.infer<typeof workflowManualTriggerSchema>;
export type WorkflowCronTrigger = z.infer<typeof workflowCronTriggerSchema>;
export type WorkflowWebhookTrigger = z.infer<
  typeof workflowWebhookTriggerSchema
>;

export type WorkflowManualTriggerSettings = WorkflowManualTrigger['settings'];
export type WorkflowManualTriggerAvailability =
  | 'EVERYWHERE'
  | 'WHEN_RECORD_SELECTED';

export type WorkflowTrigger = z.infer<typeof workflowTriggerSchema>;
export type WorkflowTriggerType = WorkflowTrigger['type'];

export type WorkflowStatus = 'DRAFT' | 'ACTIVE' | 'DEACTIVATED';
export type WorkflowVersionStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'DEACTIVATED'
  | 'ARCHIVED';

// Keep existing types that are not covered by schemas
export type WorkflowVersion = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  workflowId: string;
  trigger: WorkflowTrigger | null;
  steps: Array<WorkflowStep> | null;
  status: WorkflowVersionStatus;
  __typename: 'WorkflowVersion';
};

export type ManualTriggerWorkflowVersion = WorkflowVersion & {
  trigger: WorkflowManualTrigger | null;
};

export type WorkflowRunStatus = z.infer<typeof workflowRunStatusSchema>;

export type WorkflowRun = z.infer<typeof workflowRunSchema>;

export type WorkflowRunState = z.infer<typeof workflowRunStateSchema>;

export type WorkflowRunStepStatus = z.infer<typeof workflowRunStepStatusSchema>;

export type WorkflowRunFlow = WorkflowRunState['flow'];

export type Workflow = {
  __typename: 'Workflow';
  id: string;
  name: string;
  versions: Array<WorkflowVersion>;
  lastPublishedVersionId: string;
  statuses: Array<WorkflowStatus> | null;
};

export type WorkflowWithCurrentVersion = Workflow & {
  currentVersion: WorkflowVersion;
};
