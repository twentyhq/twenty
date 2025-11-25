import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { useRecoilCallback } from 'recoil';

export const useResetWorkflowInsertStepIds = () => {
  const workflowInsertStepIdsState = useRecoilComponentCallbackState(
    workflowInsertStepIdsComponentState,
  );

  const resetWorkflowInsertStepIds = useRecoilCallback(
    ({ reset }) =>
      () => {
        reset(workflowInsertStepIdsState);
      },
    [workflowInsertStepIdsState],
  );

  return { resetWorkflowInsertStepIds };
};
