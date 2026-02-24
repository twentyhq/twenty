import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { useCallback } from 'react';

export const useResetWorkflowInsertStepIds = () => {
  const setWorkflowInsertStepIds = useSetRecoilComponentStateV2(
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
