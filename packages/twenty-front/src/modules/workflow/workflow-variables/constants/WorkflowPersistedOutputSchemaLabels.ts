import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { doNotTranslate } from 'twenty-shared/i18n';

export const WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS: Array<{
  stepType: WorkflowActionType | WorkflowTriggerType;
  key: string;
  label: string;
  message: MessageDescriptor;
}> = doNotTranslate([
  {
    stepType: 'ITERATOR',
    key: 'currentItem',
    label: 'Current Item',
    message: msg`Current Item`,
  },
  {
    stepType: 'ITERATOR',
    key: 'currentItemIndex',
    label: 'Current Item Index',
    message: msg`Current Item Index`,
  },
  {
    stepType: 'ITERATOR',
    key: 'hasProcessedAllItems',
    label: 'Has Processed All Items',
    message: msg`Has Processed All Items`,
  },
  {
    stepType: 'AI_AGENT',
    key: 'response',
    label: 'Response',
    message: msg`Response`,
  },
  {
    stepType: 'MANUAL',
    key: 'payload',
    label: 'Record',
    message: msg`Record`,
  },
  {
    stepType: 'MANUAL',
    key: 'payload',
    label: 'Records',
    message: msg`Records`,
  },
  {
    stepType: 'MANUAL',
    key: 'metadata',
    label: 'Metadata',
    message: msg`Metadata`,
  },
  {
    stepType: 'MANUAL',
    key: 'workspaceMemberId',
    label: 'Workspace Member ID',
    message: msg`Workspace Member ID`,
  },
  {
    stepType: 'FIND_RECORDS',
    key: 'totalCount',
    label: 'Total Count',
    message: msg`Total Count`,
  },
  {
    stepType: 'WAIT_FOR_EVENT',
    key: 'recordId',
    label: 'Record ID',
    message: msg`Record ID`,
  },
  {
    stepType: 'WAIT_FOR_EVENT',
    key: 'updatedFields',
    label: 'Updated Fields',
    message: msg`Updated Fields`,
  },
  {
    stepType: 'WAIT_FOR_EVENT',
    key: 'hasTimedOut',
    label: 'Has Timed Out',
    message: msg`Has Timed Out`,
  },
  ...(['SEND_EMAIL', 'DRAFT_EMAIL', 'CREATE_CALENDAR_EVENT'] as const).map(
    (stepType) => ({
      stepType,
      key: 'success',
      label: 'Success',
      message: msg`Success`,
    }),
  ),
  {
    stepType: 'SEND_EMAIL',
    key: 'headerMessageId',
    label: 'Message-ID header',
    message: msg`Message-ID header`,
  },
  {
    stepType: 'SEND_EMAIL',
    key: 'messageId',
    label: 'Message record ID',
    message: msg`Message record ID`,
  },
  {
    stepType: 'SEND_EMAIL',
    key: 'messageThreadId',
    label: 'Message thread ID',
    message: msg`Message thread ID`,
  },
  {
    stepType: 'CREATE_CALENDAR_EVENT',
    key: 'iCalUid',
    label: 'iCal UID',
    message: msg`iCal UID`,
  },
  {
    stepType: 'CREATE_CALENDAR_EVENT',
    key: 'externalEventId',
    label: 'External Event ID',
    message: msg`External Event ID`,
  },
  {
    stepType: 'CREATE_CALENDAR_EVENT',
    key: 'conferenceLink',
    label: 'Conference Link',
    message: msg`Conference Link`,
  },
  {
    stepType: 'SEND_CHAT_MESSAGE',
    key: 'threadId',
    label: 'Conversation ID',
    message: msg`Conversation ID`,
  },
  {
    stepType: 'SEND_CHAT_MESSAGE',
    key: 'outcome',
    label: 'Outcome',
    message: msg`Outcome`,
  },
  {
    stepType: 'SEND_CHAT_MESSAGE',
    key: 'toolName',
    label: 'Action',
    message: msg`Action`,
  },
  {
    stepType: 'SEND_CHAT_MESSAGE',
    key: 'feedback',
    label: 'Feedback',
    message: msg`Feedback`,
  },
  {
    stepType: 'SEND_CHAT_MESSAGE',
    key: 'error',
    label: 'Error',
    message: msg`Error`,
  },
  {
    stepType: 'SEND_CHAT_MESSAGE',
    key: 'arguments',
    label: 'Arguments',
    message: msg`Arguments`,
  },
  {
    stepType: 'SEND_CHAT_MESSAGE',
    key: 'output',
    label: 'Output',
    message: msg`Output`,
  },
  {
    stepType: 'CLASSIFY',
    key: 'answers',
    label: 'Answers',
    message: msg`Answers`,
  },
  {
    stepType: 'CLASSIFY',
    key: 'modelId',
    label: 'Model',
    message: msg`Model`,
  },
  {
    stepType: 'CLASSIFY',
    key: 'type',
    label: 'Type',
    message: msg`Type`,
  },
  {
    stepType: 'CLASSIFY',
    key: 'choice',
    label: 'Choice',
    message: msg`Choice`,
  },
  {
    stepType: 'CLASSIFY',
    key: 'score',
    label: 'Score',
    message: msg`Score`,
  },
  {
    stepType: 'CLASSIFY',
    key: 'probabilities',
    label: 'Probabilities',
    message: msg`Probabilities`,
  },
  {
    stepType: 'CLASSIFY',
    key: 'probability',
    label: 'Probability of true',
    message: msg`Probability of true`,
  },
]);
