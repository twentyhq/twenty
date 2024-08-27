import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { createStepFromStepState } from '@/workflow/states/createStepFromStepState';
import { rightDrawerWorkflowState } from '@/workflow/states/rightDrawerWorkflowState';
import { useSetRecoilState } from 'recoil';

export const useStartNodeCreation = () => {
  const { openRightDrawer } = useRightDrawer();
  const setRightDrawerWorkflowState = useSetRecoilState(
    rightDrawerWorkflowState,
  );
  const setCreateStepFromStepState = useSetRecoilState(createStepFromStepState);

  const startNodeCreation = (parentNodeId: string) => {
    setRightDrawerWorkflowState({
      type: 'select-action',
    });
    setCreateStepFromStepState(parentNodeId);

    openRightDrawer(RightDrawerPages.Workflow);
  };

  return {
    startNodeCreation,
  };
};
