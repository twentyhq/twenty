import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { createStepFromParentStepIdState } from '@/workflow/states/createStepFromParentStepIdState';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

export const useStartNodeCreation = () => {
  const { openRightDrawer } = useRightDrawer();
  const setCreateStepFromStepState = useSetRecoilState(
    createStepFromParentStepIdState,
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
