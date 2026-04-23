import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const CREATE_RECORD_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'CREATE_RECORD'>;
  icon: string;
} = {
  defaultLabel: 'Create Record',
  type: 'CREATE_RECORD',
  icon: 'IconPlus',
};
