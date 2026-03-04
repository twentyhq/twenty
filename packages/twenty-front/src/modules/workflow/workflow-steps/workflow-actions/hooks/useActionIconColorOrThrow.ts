import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme';

export const useActionIconColorOrThrow = (actionType: WorkflowActionType) => {
  const { theme } = useContext(ThemeContext);

  return getActionIconColorOrThrow({ theme, actionType });
};
