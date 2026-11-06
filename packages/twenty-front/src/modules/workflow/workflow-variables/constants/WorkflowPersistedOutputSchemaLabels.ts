import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isRecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/guards/isRecordOutputSchemaV2';
import {
  type WorkflowActionType,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

// a label naming the step's object is built from the viewer's metadata, or left as stored without it
export type WorkflowPersistedOutputSchemaLabel =
  | MessageDescriptor
  | ((node: {
      objectMetadataItem?: EnrichedObjectMetadataItem;
      value: unknown;
    }) => string | undefined);

const SUCCESS_LABELS = { success: msg`Success` };

// keyed by node path, '*' standing for a user-defined key such as a question name
export const WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS: Partial<
  Record<
    WorkflowActionType | WorkflowTriggerType,
    Record<string, WorkflowPersistedOutputSchemaLabel>
  >
> = {
  ITERATOR: {
    currentItem: ({ objectMetadataItem }) => {
      if (!isDefined(objectMetadataItem)) {
        return t`Current Item`;
      }

      const objectLabel = objectMetadataItem.labelSingular;

      return t`Current Item (${objectLabel})`;
    },
    currentItemIndex: msg`Current Item Index`,
    hasProcessedAllItems: msg`Has Processed All Items`,
  },
  AI_AGENT: { response: msg`Response` },
  MANUAL: {
    payload: ({ value }) =>
      isRecordOutputSchemaV2(value) ? t`Record` : t`Records`,
    metadata: msg`Metadata`,
    'metadata.workspaceMemberId': msg`Workspace Member ID`,
  },
  FIND_RECORDS: {
    first: ({ objectMetadataItem }) => {
      const objectLabel = objectMetadataItem?.labelSingular;

      return isDefined(objectLabel) ? t`First ${objectLabel}` : undefined;
    },
    all: ({ objectMetadataItem }) => {
      const objectLabel = objectMetadataItem?.labelPlural;

      return isDefined(objectLabel) ? t`All ${objectLabel}` : undefined;
    },
    totalCount: msg`Total Count`,
  },
  WAIT_FOR_EVENT: {
    record: ({ objectMetadataItem }) => objectMetadataItem?.labelSingular,
    recordId: msg`Record ID`,
    before: ({ objectMetadataItem }) => {
      const objectLabel = objectMetadataItem?.labelSingular;

      return isDefined(objectLabel) ? t`${objectLabel} Before Update` : undefined;
    },
    updatedFields: msg`Updated Fields`,
    hasTimedOut: msg`Has Timed Out`,
  },
  SEND_EMAIL: {
    ...SUCCESS_LABELS,
    headerMessageId: msg`Message-ID header`,
    messageId: msg`Message record ID`,
    messageThreadId: msg`Message thread ID`,
  },
  DRAFT_EMAIL: SUCCESS_LABELS,
  CREATE_CALENDAR_EVENT: {
    ...SUCCESS_LABELS,
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
