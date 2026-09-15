import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';

export const INBOX_ITEM_TYPE_NAME = {
  conversation: 'conversation',
  agentQuestion: 'agent_question',
  agentRunFailed: 'agent_run_failed',
  workflowRunFailed: 'workflow_run_failed',
  approval: 'approval',
  agentPlan: 'agent_plan',
  inboundMessage: 'inbound_message',
  systemNotification: 'system_notification',
} as const;

export type StandardInboxItemTypeName =
  (typeof INBOX_ITEM_TYPE_NAME)[keyof typeof INBOX_ITEM_TYPE_NAME];

export type StandardInboxItemType = {
  universalIdentifier: string;
  name: StandardInboxItemTypeName;
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
    name: INBOX_ITEM_TYPE_NAME.conversation,
    label: 'Conversation',
    icon: 'IconMessageCircle',
    defaultPriority: InboxItemPriority.UPDATE,
  },
  {
    universalIdentifier: '09c33ca6-4828-488a-b792-6095d5f2372e',
    name: INBOX_ITEM_TYPE_NAME.agentQuestion,
    label: 'Question from an agent',
    icon: 'IconHelpCircle',
    defaultPriority: InboxItemPriority.NEEDS_ACTION,
  },
  {
    universalIdentifier: 'e91103ec-021e-4481-b609-6d4e9ae38422',
    name: INBOX_ITEM_TYPE_NAME.agentRunFailed,
    label: 'Agent run failed',
    icon: 'IconAlertTriangle',
    defaultPriority: InboxItemPriority.NEEDS_ACTION,
  },
  {
    universalIdentifier: 'e5cc1883-772f-4de7-9893-9eaa433ae767',
    name: INBOX_ITEM_TYPE_NAME.workflowRunFailed,
    label: 'Workflow run failed',
    icon: 'IconAlertTriangle',
    defaultPriority: InboxItemPriority.NEEDS_ACTION,
  },
  {
    universalIdentifier: 'b1f3c0d2-3a7e-4a3f-9a58-51e1a2c9d4b7',
    name: INBOX_ITEM_TYPE_NAME.approval,
    label: 'Approval',
    icon: 'IconCircleCheck',
    defaultPriority: InboxItemPriority.NEEDS_ACTION,
  },
  {
    universalIdentifier: '7c2f4a9e-6d1b-4e8f-9a3c-2b5d8e1f4a6c',
    name: INBOX_ITEM_TYPE_NAME.agentPlan,
    label: 'Plan from an agent',
    icon: 'IconSparkles',
    defaultPriority: InboxItemPriority.NEEDS_ACTION,
  },
  {
    universalIdentifier: 'a3d81f0e-58cc-4a52-9b3d-7e0c2f4b6a19',
    name: INBOX_ITEM_TYPE_NAME.inboundMessage,
    label: 'Message',
    icon: 'IconMail',
    defaultPriority: InboxItemPriority.NEEDS_ACTION,
  },
  {
    universalIdentifier: 'c6e0b27d-9f41-4a8b-8c15-3d7a9e2f5b08',
    name: INBOX_ITEM_TYPE_NAME.systemNotification,
    label: 'Notification',
    icon: 'IconBell',
    defaultPriority: InboxItemPriority.UPDATE,
  },
];
