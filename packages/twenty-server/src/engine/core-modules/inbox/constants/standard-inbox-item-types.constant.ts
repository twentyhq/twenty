import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';

export const INBOX_ITEM_TYPE_KEY = {
  conversation: 'conversation',
  agentQuestion: 'agent_question',
  workflowRunFailed: 'workflow_run_failed',
  approval: 'approval',
  agentPlan: 'agent_plan',
} as const;

export type StandardInboxItemTypeKey =
  (typeof INBOX_ITEM_TYPE_KEY)[keyof typeof INBOX_ITEM_TYPE_KEY];

export type StandardInboxItemType = {
  universalIdentifier: string;
  key: StandardInboxItemTypeKey;
  label: string;
  icon: string;
  defaultPriority: InboxItemPriority;
};

// Built-in types, owned by the twenty standard application; app-declared types
// are rows in the same table with the app's applicationId. A type is only an
// identity for routing and rendering.
export const STANDARD_INBOX_ITEM_TYPES: StandardInboxItemType[] = [
  {
    universalIdentifier: 'd5bb4752-1f7c-45ba-817a-d4908491719a',
    key: INBOX_ITEM_TYPE_KEY.conversation,
    label: 'Conversation',
    icon: 'IconMessageCircle',
    defaultPriority: InboxItemPriority.UPDATE,
  },
  {
    universalIdentifier: '09c33ca6-4828-488a-b792-6095d5f2372e',
    key: INBOX_ITEM_TYPE_KEY.agentQuestion,
    label: 'Question from an agent',
    icon: 'IconHelpCircle',
    defaultPriority: InboxItemPriority.NEEDS_ACTION,
  },
  {
    universalIdentifier: 'e5cc1883-772f-4de7-9893-9eaa433ae767',
    key: INBOX_ITEM_TYPE_KEY.workflowRunFailed,
    label: 'Workflow run failed',
    icon: 'IconAlertTriangle',
    defaultPriority: InboxItemPriority.NEEDS_ACTION,
  },
  {
    universalIdentifier: 'b1f3c0d2-3a7e-4a3f-9a58-51e1a2c9d4b7',
    key: INBOX_ITEM_TYPE_KEY.approval,
    label: 'Approval',
    icon: 'IconCircleCheck',
    defaultPriority: InboxItemPriority.NEEDS_ACTION,
  },
  {
    universalIdentifier: '7c2f4a9e-6d1b-4e8f-9a3c-2b5d8e1f4a6c',
    key: INBOX_ITEM_TYPE_KEY.agentPlan,
    label: 'Plan from an agent',
    icon: 'IconSparkles',
    defaultPriority: InboxItemPriority.NEEDS_ACTION,
  },
];
