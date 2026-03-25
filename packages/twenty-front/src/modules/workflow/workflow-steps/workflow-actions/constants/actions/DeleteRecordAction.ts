import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const DELETE_RECORD_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'DELETE_RECORD'>;
  icon: string;
} = {
  defaultLabel: 'Delete Record',
  type: 'DELETE_RECORD',
  icon: 'IconTrash',
};
