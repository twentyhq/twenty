import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';

export const useActionIconColorOrThrow = (
  actionType: WorkflowActionType,
): string => getActionIconColorOrThrow(actionType);
