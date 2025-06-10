import { WorkflowActionType } from '@/workflow/types/Workflow';
import { getActionHeaderTypeOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionHeaderTypeOrThrow';
import { useLingui } from '@lingui/react';

export const useActionHeaderTypeOrThrow = (actionType: WorkflowActionType) => {
  const { _ } = useLingui();

  return _(getActionHeaderTypeOrThrow(actionType));
};
