import {
  type WorkflowDraftEmailAction,
  type WorkflowSendEmailAction,
} from '@/workflow/types/Workflow';

export type WorkflowEmailAction =
  | WorkflowSendEmailAction
  | WorkflowDraftEmailAction;
