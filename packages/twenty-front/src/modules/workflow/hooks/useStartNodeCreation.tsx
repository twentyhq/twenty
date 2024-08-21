import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { rightDrawerWorkflowState } from '@/workflow/states/rightDrawerWorkflowState';
import { useSetRecoilState } from 'recoil';

export const useStartNodeCreation = () => {
  const { openRightDrawer } = useRightDrawer();
  const setRightDrawerWorkflowState = useSetRecoilState(
    rightDrawerWorkflowState,
  );

  const startNodeCreation = () => {
    setRightDrawerWorkflowState({
      type: 'select-action',
    });

    openRightDrawer(RightDrawerPages.Workflow);
  };

  return {
    startNodeCreation,
  };
};
