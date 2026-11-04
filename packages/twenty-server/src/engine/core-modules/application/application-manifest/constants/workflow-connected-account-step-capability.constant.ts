import { type WorkflowConnectedAccountStepType } from 'src/engine/core-modules/application/application-manifest/types/workflow-connected-account-step-type.type';

export const WORKFLOW_CONNECTED_ACCOUNT_STEP_CAPABILITY: Record<
  WorkflowConnectedAccountStepType,
  string
> = {
  SEND_EMAIL: 'send email',
  DRAFT_EMAIL: 'draft email',
  CREATE_CALENDAR_EVENT: 'create calendar events',
};
