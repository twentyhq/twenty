import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const HTTP_REQUEST_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'HTTP_REQUEST'>;
  icon: string;
} = {
  defaultLabel: 'HTTP Request',
  type: 'HTTP_REQUEST',
  icon: 'IconWorld',
};
