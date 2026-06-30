import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { CODE_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/CodeAction';
import { CREATE_CALENDAR_EVENT_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/CreateCalendarEventAction';
import { DRAFT_EMAIL_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/DraftEmailAction';
import { HTTP_REQUEST_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/HttpRequestAction';
import { SEND_EMAIL_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/SendEmailAction';

export const CORE_ACTIONS: Array<{
  defaultLabel: string;
  type: Extract<
    WorkflowActionType,
    | 'CODE'
    | 'SEND_EMAIL'
    | 'DRAFT_EMAIL'
    | 'HTTP_REQUEST'
    | 'CREATE_CALENDAR_EVENT'
  >;
  icon: string;
}> = [
  SEND_EMAIL_ACTION,
  DRAFT_EMAIL_ACTION,
  CREATE_CALENDAR_EVENT_ACTION,
  CODE_ACTION,
  HTTP_REQUEST_ACTION,
];
