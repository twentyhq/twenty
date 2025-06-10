import { WorkflowActionType } from '@/workflow/types/Workflow';

export const OTHER_ACTIONS: Array<{
  label: string;
  type: Exclude<
    WorkflowActionType,
    'CREATE_RECORD' | 'UPDATE_RECORD' | 'DELETE_RECORD' | 'FIND_RECORDS'
  >;
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
