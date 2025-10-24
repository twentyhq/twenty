import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const CODE_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'CODE'>;
  icon: string;
} = {
  defaultLabel: 'Code - Serverless Function',
  type: 'CODE',
  icon: 'IconCode',
};
