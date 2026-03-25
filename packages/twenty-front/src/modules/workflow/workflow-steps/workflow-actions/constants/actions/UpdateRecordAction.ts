import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const UPDATE_RECORD_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'UPDATE_RECORD'>;
  icon: string;
} = {
  defaultLabel: 'Update Record',
  type: 'UPDATE_RECORD',
  icon: 'IconReload',
};
