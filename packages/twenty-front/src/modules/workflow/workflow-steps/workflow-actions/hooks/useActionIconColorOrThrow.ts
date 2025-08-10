import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { useTheme } from '@emotion/react';

export const useActionIconColorOrThrow = (actionType: WorkflowActionType) => {
  const theme = useTheme();

  return getActionIconColorOrThrow({ theme, actionType });
};
