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

  const startNodeCreation = useCallback(
    (parentNodeId: string) => {
      setCreateStepFromStepState(parentNodeId);

      openRightDrawer(RightDrawerPages.WorkflowSelectAction);
    },
    [openRightDrawer, setCreateStepFromStepState],
  );

  return {
    startNodeCreation,
  };
};
