import { InboxItemBinding } from 'src/engine/core-modules/inbox/enums/inbox-item-binding.enum';
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { type InboxItemAction } from 'src/engine/core-modules/inbox/types/inbox-item-action.type';

export const INBOX_ITEM_TYPE_KEY = {
  conversation: 'conversation',
  agentQuestion: 'agent_question',
  workflowRunFailed: 'workflow_run_failed',
} as const;

export type StandardInboxItemTypeKey =
  (typeof INBOX_ITEM_TYPE_KEY)[keyof typeof INBOX_ITEM_TYPE_KEY];

export type StandardInboxItemType = {
  universalIdentifier: string;
  key: string;
  label: string;
  icon: string;
  binding: InboxItemBinding;
  defaultPriority: InboxItemPriority;
  actions: InboxItemAction[];
};

// Built-in types, owned by the twenty standard application. App-declared types
// are rows in the same table with the app's applicationId.
export const STANDARD_INBOX_ITEM_TYPES: StandardInboxItemType[] = [
  {
    universalIdentifier: 'd5bb4752-1f7c-45ba-817a-d4908491719a',
    key: INBOX_ITEM_TYPE_KEY.conversation,
    label: 'Conversation',
    icon: 'IconMessageCircle',
    binding: InboxItemBinding.SUBJECT,
    defaultPriority: InboxItemPriority.LOW,
    actions: [
      {
        key: 'open',
        label: 'Open',
        isPrimary: true,
        handler: { kind: 'OPEN_THREAD' },
      },
      { key: 'done', label: 'Mark done', handler: { kind: 'COMPLETE' } },
    ],
  },
  {
    universalIdentifier: '09c33ca6-4828-488a-b792-6095d5f2372e',
    key: INBOX_ITEM_TYPE_KEY.agentQuestion,
    label: 'Question from an agent',
    icon: 'IconHelpCircle',
    binding: InboxItemBinding.SUBJECT,
    defaultPriority: InboxItemPriority.NEEDS_ACTION,
    actions: [
      {
        key: 'answer',
        label: 'Answer',
        isPrimary: true,
        handler: { kind: 'OPEN_THREAD' },
      },
      {
        key: 'snooze',
        label: 'Snooze for an hour',
        handler: { kind: 'SNOOZE', durationMinutes: 60 },
      },
    ],
  },
  {
    universalIdentifier: 'e5cc1883-772f-4de7-9893-9eaa433ae767',
    key: INBOX_ITEM_TYPE_KEY.workflowRunFailed,
    label: 'Workflow run failed',
    icon: 'IconAlertTriangle',
    binding: InboxItemBinding.OCCURRENCE,
    defaultPriority: InboxItemPriority.NEEDS_ACTION,
    actions: [
      {
        key: 'openRun',
        label: 'Open run',
        isPrimary: true,
        handler: { kind: 'OPEN_SUBJECT_RECORD' },
      },
      { key: 'done', label: 'Mark done', handler: { kind: 'COMPLETE' } },
    ],
  },
];
