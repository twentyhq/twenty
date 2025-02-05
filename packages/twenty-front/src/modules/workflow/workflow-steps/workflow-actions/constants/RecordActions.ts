import { WorkflowStepType } from 'twenty-shared';

export const RECORD_ACTIONS: Array<{
  label: string;
  type: WorkflowStepType;
  icon: string;
}> = [
  {
    label: 'Create Record',
    type: 'CREATE_RECORD',
    icon: 'IconPlus',
  },
  {
    label: 'Update Record',
    type: 'UPDATE_RECORD',
    icon: 'IconRefreshDot',
  },
  {
    label: 'Delete Record',
    type: 'DELETE_RECORD',
    icon: 'IconTrash',
  },
];
