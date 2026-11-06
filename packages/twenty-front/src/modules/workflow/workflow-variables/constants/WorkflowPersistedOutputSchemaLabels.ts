import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

// keyed by node path, '*' standing for a user-defined key such as a question name
export const WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS: Partial<
  Record<
    WorkflowActionType | WorkflowTriggerType,
    Record<string, MessageDescriptor>
  >
> = {
  ITERATOR: {
    currentItemIndex: msg`Current Item Index`,
    hasProcessedAllItems: msg`Has Processed All Items`,
  },
  AI_AGENT: { response: msg`Response` },
  MANUAL: {
    metadata: msg`Metadata`,
    'metadata.workspaceMemberId': msg`Workspace Member ID`,
  },
  FIND_RECORDS: { totalCount: msg`Total Count` },
  WAIT_FOR_EVENT: {
    recordId: msg`Record ID`,
    updatedFields: msg`Updated Fields`,
    hasTimedOut: msg`Has Timed Out`,
  },
  SEND_EMAIL: {
    success: msg`Success`,
    headerMessageId: msg`Message-ID header`,
    messageId: msg`Message record ID`,
    messageThreadId: msg`Message thread ID`,
  },
  DRAFT_EMAIL: { success: msg`Success` },
  CREATE_CALENDAR_EVENT: {
    success: msg`Success`,
    iCalUid: msg`iCal UID`,
    externalEventId: msg`External Event ID`,
    conferenceLink: msg`Conference Link`,
  },
  SEND_CHAT_MESSAGE: {
    threadId: msg`Conversation ID`,
    outcome: msg`Outcome`,
    toolName: msg`Action`,
    feedback: msg`Feedback`,
    error: msg`Error`,
    arguments: msg`Arguments`,
    output: msg`Output`,
  },
  CLASSIFY: {
    answers: msg`Answers`,
    modelId: msg`Model`,
    'answers.*.type': msg`Type`,
    'answers.*.choice': msg`Choice`,
    'answers.*.score': msg`Score`,
    'answers.*.probabilities': msg`Probabilities`,
    'answers.*.probability': msg`Probability of true`,
  },
};
