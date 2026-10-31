import { type AiRunScope } from 'twenty-shared/ai';

import { WORKFLOW_AI_AGENT_ALL_OBJECTS_PERMISSION_KEYS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentAllObjectsPermissionKeys';

export const hasWorkflowAiAgentAllObjectsPermissionInScope = (
  scope: AiRunScope | undefined,
): boolean =>
  Object.values(WORKFLOW_AI_AGENT_ALL_OBJECTS_PERMISSION_KEYS).some(
    (allObjectsPermissionKey) => scope?.[allObjectsPermissionKey] ?? false,
  );
