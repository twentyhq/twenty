import { WorkflowStepType } from '@/workflow/types/Workflow';

export const OTHER_ACTIONS: Array<{
  label: string;
  type: WorkflowStepType;
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
    label: 'Form',
    type: 'FORM',
    icon: 'IconForms',
  },
];
