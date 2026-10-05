import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { type MessageDescriptor } from '@lingui/core';
import { AI_AGENT_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/AiAgentAction';
import { CLASSIFY_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/ClassifyAction';

export const AI_ACTIONS: Array<{
  defaultLabel: MessageDescriptor;
  type: Extract<WorkflowActionType, 'AI_AGENT' | 'CLASSIFY'>;
  icon: string;
}> = [AI_AGENT_ACTION, CLASSIFY_ACTION];
