import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const FORM_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'FORM'>;
  icon: string;
} = {
  defaultLabel: 'Form',
  type: 'FORM',
  icon: 'IconForms',
};
