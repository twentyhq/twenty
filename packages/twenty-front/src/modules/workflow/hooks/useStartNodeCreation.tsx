import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { workflowCreateStepFropParentStepId } from '@/workflow/states/workflowCreateStepFropParentStepId';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

export const useStartNodeCreation = () => {
  const { openRightDrawer } = useRightDrawer();
  const setCreateStepFromStepState = useSetRecoilState(
    workflowCreateStepFropParentStepId,
  );

  /**
   * This function is used in a context where dependencies shouldn't change much.
   * That's why its wrapped in a `useCallback` hook.
   */
  const startNodeCreation = useCallback(
    (parentNodeId: string) => {
      setCreateStepFromStepState(parentNodeId);

      openRightDrawer(RightDrawerPages.WorkflowStepSelectAction);
    },
    [openRightDrawer, setCreateStepFromStepState],
  );

  return {
    startNodeCreation,
  };
};
