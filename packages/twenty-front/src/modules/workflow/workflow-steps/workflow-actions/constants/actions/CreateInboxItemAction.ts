import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const CREATE_INBOX_ITEM_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'CREATE_INBOX_ITEM'>;
  icon: string;
} = {
  defaultLabel: 'Create Inbox Item',
  type: 'CREATE_INBOX_ITEM',
  icon: 'IconInbox',
};
