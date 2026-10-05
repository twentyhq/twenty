import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { AI_AGENT_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/AiAgentAction';
import { CODE_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/CodeAction';
import { CREATE_CALENDAR_EVENT_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/CreateCalendarEventAction';
import { CREATE_RECORD_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/CreateRecordAction';
import { DELAY_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/DelayAction';
import { DELETE_RECORD_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/DeleteRecordAction';
import { DRAFT_EMAIL_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/DraftEmailAction';
import { FILTER_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/FilterAction';
import { FIND_RECORDS_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/FindRecordsAction';
import { FORM_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/FormAction';
import { HTTP_REQUEST_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/HttpRequestAction';
import { ITERATOR_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/IteratorAction';
import { PICK_RECORD_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/PickRecordAction';
import { SEND_CHAT_MESSAGE_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/SendChatMessageAction';
import { SEND_EMAIL_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/SendEmailAction';
import { UPDATE_RECORD_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/UpdateRecordAction';
import { UPSERT_RECORD_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/UpsertRecordAction';
import { WAIT_FOR_EVENT_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/WaitForEventAction';
import { DatabaseTriggerDefaultLabel } from '@/workflow/workflow-trigger/constants/DatabaseTriggerDefaultLabel';
import { CRON_TRIGGER } from '@/workflow/workflow-trigger/constants/triggers/CronTrigger';
import { MANUAL_TRIGGER } from '@/workflow/workflow-trigger/constants/triggers/ManualTrigger';
import { WEBHOOK_TRIGGER } from '@/workflow/workflow-trigger/constants/triggers/WebhookTrigger';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

// Steps and triggers store these English names when they are created, so they are translated when displayed, never when written
export const WORKFLOW_STEP_DEFAULT_NAMES: Array<{
  type: WorkflowActionType | WorkflowTriggerType;
  name: string;
  label: MessageDescriptor;
}> = [
  {
    type: 'CODE',
    name: 'Code - Logic Function',
    label: CODE_ACTION.defaultLabel,
  },
  {
    type: 'SEND_EMAIL',
    name: 'Send Email',
    label: SEND_EMAIL_ACTION.defaultLabel,
  },
  {
    type: 'SEND_CHAT_MESSAGE',
    name: 'Send to Inbox',
    label: SEND_CHAT_MESSAGE_ACTION.defaultLabel,
  },
  {
    type: 'CREATE_CALENDAR_EVENT',
    name: 'Create Calendar Event',
    label: CREATE_CALENDAR_EVENT_ACTION.defaultLabel,
  },
  {
    type: 'DRAFT_EMAIL',
    name: 'Draft Email',
    label: DRAFT_EMAIL_ACTION.defaultLabel,
  },
  {
    type: 'CREATE_RECORD',
    name: 'Create Record',
    label: CREATE_RECORD_ACTION.defaultLabel,
  },
  {
    type: 'UPDATE_RECORD',
    name: 'Update Record',
    label: UPDATE_RECORD_ACTION.defaultLabel,
  },
  {
    type: 'DELETE_RECORD',
    name: 'Delete Record',
    label: DELETE_RECORD_ACTION.defaultLabel,
  },
  {
    type: 'UPSERT_RECORD',
    name: 'Create or Update Record',
    label: UPSERT_RECORD_ACTION.defaultLabel,
  },
  {
    type: 'FIND_RECORDS',
    name: 'Search Records',
    label: FIND_RECORDS_ACTION.defaultLabel,
  },
  {
    type: 'PICK_RECORD',
    name: 'Pick Record',
    label: PICK_RECORD_ACTION.defaultLabel,
  },
  {
    type: 'FORM',
    name: 'Form',
    label: FORM_ACTION.defaultLabel,
  },
  {
    type: 'FILTER',
    name: 'Filter',
    label: FILTER_ACTION.defaultLabel,
  },
  {
    type: 'HTTP_REQUEST',
    name: 'HTTP Request',
    label: HTTP_REQUEST_ACTION.defaultLabel,
  },
  {
    type: 'AI_AGENT',
    name: 'Agent',
    label: AI_AGENT_ACTION.defaultLabel,
  },
  {
    type: 'CLASSIFY',
    name: 'Classify',
    label: msg`Classify`,
  },
  {
    type: 'ITERATOR',
    name: 'Iterator',
    label: ITERATOR_ACTION.defaultLabel,
  },
  {
    type: 'IF_ELSE',
    name: 'If/Else',
    label: msg`If/Else`,
  },
  {
    type: 'DELAY',
    name: 'Delay',
    label: DELAY_ACTION.defaultLabel,
  },
  {
    type: 'WAIT_FOR_EVENT',
    name: 'Wait for Event',
    label: WAIT_FOR_EVENT_ACTION.defaultLabel,
  },
  {
    type: 'EMPTY',
    name: 'Add an Action',
    label: msg`Add an Action`,
  },
  {
    type: 'MANUAL',
    name: MANUAL_TRIGGER.defaultLabel,
    label: msg`Launch manually`,
  },
  {
    type: 'MANUAL',
    name: 'Manual trigger',
    label: msg`Manual trigger`,
  },
  {
    type: 'CRON',
    name: CRON_TRIGGER.defaultLabel,
    label: msg`On a schedule`,
  },
  {
    type: 'WEBHOOK',
    name: WEBHOOK_TRIGGER.defaultLabel,
    label: msg`Webhook`,
  },
  {
    type: 'DATABASE_EVENT',
    name: DatabaseTriggerDefaultLabel.RECORD_IS_CREATED,
    label: msg`Record is created`,
  },
  {
    type: 'DATABASE_EVENT',
    name: DatabaseTriggerDefaultLabel.RECORD_IS_UPDATED,
    label: msg`Record is updated`,
  },
  {
    type: 'DATABASE_EVENT',
    name: DatabaseTriggerDefaultLabel.RECORD_IS_DELETED,
    label: msg`Record is deleted`,
  },
  {
    type: 'DATABASE_EVENT',
    name: DatabaseTriggerDefaultLabel.RECORD_UPSERTED,
    label: msg`Record is created or updated`,
  },
];
