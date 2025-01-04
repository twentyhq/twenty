import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { workflowCreateStepFromParentStepIdState } from '@/workflow/workflow-steps/states/workflowCreateStepFromParentStepIdState';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

export const useStartNodeCreation = () => {
  const { openRightDrawer } = useRightDrawer();
  const setWorkflowCreateStepFromParentStepId = useSetRecoilState(
    workflowCreateStepFromParentStepIdState,
  );
  const setHotkeyScope = useSetHotkeyScope();

  /**
   * This function is used in a context where dependencies shouldn't change much.
   * That's why its wrapped in a `useCallback` hook. Removing memoization might break the app unexpectedly.
   */
  const startNodeCreation = useCallback(
    (parentNodeId: string) => {
      setWorkflowCreateStepFromParentStepId(parentNodeId);

      setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
      openRightDrawer(RightDrawerPages.WorkflowStepSelectAction);
    },
    [openRightDrawer, setWorkflowCreateStepFromParentStepId, setHotkeyScope],
  );

  return {
    startNodeCreation,
  };
};
