import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { useCallback } from 'react';

export const useResetWorkflowInsertStepIds = () => {
  const setWorkflowInsertStepIds = useSetAtomComponentState(
    workflowInsertStepIdsComponentState,
  );

  const resetWorkflowInsertStepIds = useCallback(() => {
    setWorkflowInsertStepIds({
      parentStepId: undefined,
      nextStepId: undefined,
      position: undefined,
      connectionOptions: undefined,
    });
  }, [setWorkflowInsertStepIds]);

  return { resetWorkflowInsertStepIds };
};
