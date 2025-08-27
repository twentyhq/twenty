import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const CORE_ACTIONS: Array<{
  label: string;
  type: Extract<WorkflowActionType, 'CODE' | 'SEND_EMAIL' | 'HTTP_REQUEST'>;
  icon: string;
}> = [
  {
    label: 'Send Email',
    type: 'SEND_EMAIL',
    icon: 'IconSend',
  },
  {
    label: 'Code',
    type: 'CODE',
    icon: 'IconCode',
  },
  {
    label: 'HTTP Request',
    type: 'HTTP_REQUEST',
    icon: 'IconWorld',
  },
];
