import { WorkflowStepType } from '@/workflow/types/Workflow';
import { IconCode, IconComponent, IconSend } from 'twenty-ui';

export const OTHER_ACTIONS: Array<{
  label: string;
  type: WorkflowStepType;
  icon: IconComponent;
}> = [
  {
    label: 'Send Email',
    type: 'SEND_EMAIL',
    icon: IconSend,
  },
  {
    label: 'Code',
    type: 'CODE',
    icon: IconCode,
  },
];
