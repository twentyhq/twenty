import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const CLASSIFY_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'CLASSIFY'>;
  icon: string;
} = {
  defaultLabel: 'Classify',
  type: 'CLASSIFY',
  icon: 'IconCategory',
};
