import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const DRAFT_EMAIL_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'DRAFT_EMAIL'>;
  icon: string;
} = {
  defaultLabel: 'Draft Email',
  type: 'DRAFT_EMAIL',
  icon: 'IconMailPlus',
};
