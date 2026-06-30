import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { AI_AGENT_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/AiAgentAction';

export const AI_ACTIONS: Array<{
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'AI_AGENT'>;
  icon: string;
}> = [AI_AGENT_ACTION];
