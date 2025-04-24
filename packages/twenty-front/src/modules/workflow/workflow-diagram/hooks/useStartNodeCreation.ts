import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowCreateStepFromParentStepIdState } from '@/workflow/workflow-steps/states/workflowCreateStepFromParentStepIdState';
import { isDefined } from 'twenty-shared/utils';

export const useStartNodeCreation = () => {
  const setWorkflowCreateStepFromParentStepId = useSetRecoilState(
    workflowCreateStepFromParentStepIdState,
  );
  const { openStepSelectInCommandMenu } = useWorkflowCommandMenu();

  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );

  /**
   * This function is used in a context where dependencies shouldn't change much.
   * That's why its wrapped in a `useCallback` hook. Removing memoization might break the app unexpectedly.
   */
  const startNodeCreation = useCallback(
    (parentNodeId: string) => {
      setWorkflowCreateStepFromParentStepId(parentNodeId);

      if (isDefined(workflowVisualizerWorkflowId)) {
        openStepSelectInCommandMenu(workflowVisualizerWorkflowId);
        return;
      }
    },
    [
      setWorkflowCreateStepFromParentStepId,
      workflowVisualizerWorkflowId,
      openStepSelectInCommandMenu,
    ],
  );

  return {
    startNodeCreation,
  };
};
