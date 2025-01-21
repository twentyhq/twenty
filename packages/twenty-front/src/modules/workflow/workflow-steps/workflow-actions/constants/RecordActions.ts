import { WorkflowStepType } from '@/workflow/types/Workflow';
import { IconComponent, IconPlus, IconRefreshDot, IconTrash } from 'twenty-ui';

export const RECORD_ACTIONS: Array<{
  label: string;
  type: WorkflowStepType;
  icon: IconComponent;
}> = [
  {
    label: 'Create Record',
    type: 'CREATE_RECORD',
    icon: IconPlus,
  },
  {
    label: 'Update Record',
    type: 'UPDATE_RECORD',
    icon: IconRefreshDot,
  },
  {
    label: 'Delete Record',
    type: 'DELETE_RECORD',
    icon: IconTrash,
  },
];
