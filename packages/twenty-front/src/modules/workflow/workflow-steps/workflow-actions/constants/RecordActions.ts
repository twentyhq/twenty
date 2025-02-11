import { WorkflowStepType } from '@/workflow/types/Workflow';

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
    icon: 'IconReload',
  },
  {
    label: 'Delete Record',
    type: 'DELETE_RECORD',
    icon: 'IconTrash',
  },
];
