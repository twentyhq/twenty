import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const HUMAN_INPUT_ACTIONS: Array<{
  label: string;
  type: Extract<WorkflowActionType, 'FORM'>;
  icon: string;
}> = [
  {
    label: 'Form',
    type: 'FORM',
    icon: 'IconForms',
  },
];
