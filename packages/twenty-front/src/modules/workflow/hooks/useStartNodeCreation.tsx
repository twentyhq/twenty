import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { createStepFromStepState } from '@/workflow/states/createStepFromStepState';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

export const useStartNodeCreation = () => {
  const { openRightDrawer } = useRightDrawer();
  const setCreateStepFromStepState = useSetRecoilState(createStepFromStepState);

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
