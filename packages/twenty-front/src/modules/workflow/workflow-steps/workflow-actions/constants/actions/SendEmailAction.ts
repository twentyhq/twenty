import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const SEND_EMAIL_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'SEND_EMAIL'>;
  icon: string;
} = {
  defaultLabel: 'Send Email',
  type: 'SEND_EMAIL',
  icon: 'IconSend',
};
