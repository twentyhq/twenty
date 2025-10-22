import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const FIND_RECORDS_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'FIND_RECORDS'>;
  icon: string;
} = {
  defaultLabel: 'Search Records',
  type: 'FIND_RECORDS',
  icon: 'IconSearch',
};
