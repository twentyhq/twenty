import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { type InboxItemAction } from 'src/engine/core-modules/inbox/types/inbox-item-action.type';
import { type InboxItemResolution } from 'src/engine/core-modules/inbox/types/inbox-item-resolution.type';

export const INBOX_ITEM_TYPE_KEY = {
  conversation: 'conversation',
  agentQuestion: 'agent_question',
  workflowRunFailed: 'workflow_run_failed',
  approval: 'approval',
} as const;

export type StandardInboxItemTypeKey =
  (typeof INBOX_ITEM_TYPE_KEY)[keyof typeof INBOX_ITEM_TYPE_KEY];

export type StandardInboxItemType = {
  universalIdentifier: string;
  key: StandardInboxItemTypeKey;
  label: string;
  icon: string;
  defaultPriority: InboxItemPriority;
  actions: InboxItemAction[];
  resolution?: InboxItemResolution;
};

// Built-in types, owned by the twenty standard application. App-declared types
// are rows in the same table with the app's applicationId. Note how little the
// engine learns from these: an approval and a question differ only by the
// outcomes they declare and the transitions their actions name.
export const STANDARD_INBOX_ITEM_TYPES: StandardInboxItemType[] = [
  {
    universalIdentifier: 'd5bb4752-1f7c-45ba-817a-d4908491719a',
    key: INBOX_ITEM_TYPE_KEY.conversation,
    label: 'Conversation',
    icon: 'IconMessageCircle',
    defaultPriority: InboxItemPriority.UPDATE,
    resolution: {
      outcomes: [{ key: 'DONE', label: 'Done' }],
    },
    actions: [
      {
        key: 'open',
        label: 'Open',
        isPrimary: true,
        navigation: { kind: 'OPEN_THREAD' },
      },
      {
        key: 'done',
        label: 'Mark done',
        transition: { kind: 'CLEAR', outcome: 'DONE' },
      },
    ],
  },
  {
    universalIdentifier: '09c33ca6-4828-488a-b792-6095d5f2372e',
    key: INBOX_ITEM_TYPE_KEY.agentQuestion,
    label: 'Question from an agent',
    icon: 'IconHelpCircle',
    defaultPriority: InboxItemPriority.NEEDS_ACTION,
    resolution: {
      outcomes: [
        {
          key: 'ANSWERED',
          label: 'Answered',
        },
      ],
    },
    actions: [
      {
        key: 'answer',
        label: 'Answer',
        isPrimary: true,
        navigation: { kind: 'OPEN_THREAD' },
      },
      {
        key: 'snooze',
        label: 'Snooze for an hour',
        transition: { kind: 'CLEAR', resurfaceInMinutes: 60 },
      },
    ],
  },
  {
    universalIdentifier: 'e5cc1883-772f-4de7-9893-9eaa433ae767',
    key: INBOX_ITEM_TYPE_KEY.workflowRunFailed,
    label: 'Workflow run failed',
    icon: 'IconAlertTriangle',
    defaultPriority: InboxItemPriority.NEEDS_ACTION,
    resolution: {
      outcomes: [{ key: 'ACKNOWLEDGED', label: 'Acknowledged' }],
    },
    actions: [
      {
        key: 'openRun',
        label: 'Open run',
        isPrimary: true,
        navigation: { kind: 'OPEN_SUBJECT_RECORD' },
      },
      {
        key: 'acknowledge',
        label: 'Mark done',
        transition: { kind: 'CLEAR', outcome: 'ACKNOWLEDGED' },
      },
    ],
  },
  {
    universalIdentifier: 'b1f3c0d2-3a7e-4a3f-9a58-51e1a2c9d4b7',
    key: INBOX_ITEM_TYPE_KEY.approval,
    label: 'Approval',
    icon: 'IconCircleCheck',
    defaultPriority: InboxItemPriority.NEEDS_ACTION,
    resolution: {
      outcomes: [
        { key: 'APPROVED', label: 'Approved' },
        {
          key: 'CHANGES_REQUESTED',
          label: 'Changes requested',
        },
        {
          key: 'REJECTED',
          label: 'Rejected',
        },
      ],
    },
    actions: [
      {
        key: 'approve',
        label: 'Approve',
        isPrimary: true,
        transition: { kind: 'CLEAR', outcome: 'APPROVED' },
      },
      {
        key: 'requestChanges',
        label: 'Request changes',
        inputSchema: [
          {
            key: 'feedback',
            label: 'Feedback',
            type: 'LONG_TEXT',
            isRequired: true,
          },
        ],
        transition: { kind: 'CLEAR', outcome: 'CHANGES_REQUESTED' },
      },
      {
        key: 'reject',
        label: 'Reject',
        inputSchema: [{ key: 'reason', label: 'Reason', type: 'TEXT' }],
        transition: { kind: 'CLEAR', outcome: 'REJECTED' },
      },
    ],
  },
];
