import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const IF_ELSE_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'IF_ELSE'>;
  icon: string;
} = {
  defaultLabel: 'If/else',
  type: 'IF_ELSE',
  icon: 'IconArrowsSplit',
};
