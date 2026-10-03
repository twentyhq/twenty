import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const SEND_CHAT_MESSAGE_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'SEND_CHAT_MESSAGE'>;
  icon: string;
} = {
  defaultLabel: 'Send Chat Message',
  type: 'SEND_CHAT_MESSAGE',
  icon: 'IconMessage',
};
