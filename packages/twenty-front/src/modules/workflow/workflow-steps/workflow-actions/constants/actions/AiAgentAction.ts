import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const AI_AGENT_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'AI_AGENT'>;
  icon: string;
} = {
  defaultLabel: 'Agent',
  type: 'AI_AGENT',
  icon: 'IconLego',
};
