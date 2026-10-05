import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const SEND_CHAT_MESSAGE_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'SEND_CHAT_MESSAGE'>;
  icon: string;
} = {
  defaultLabel: msg`Send to Inbox`,
  type: 'SEND_CHAT_MESSAGE',
  icon: 'IconMessage',
};
