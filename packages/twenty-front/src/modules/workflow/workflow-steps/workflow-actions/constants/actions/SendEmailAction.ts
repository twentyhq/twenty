import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const SEND_EMAIL_ACTION: {
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'SEND_EMAIL'>;
  icon: string;
} = {
  defaultLabel: msg`Send Email`,
  type: 'SEND_EMAIL',
  icon: 'IconSend',
};
