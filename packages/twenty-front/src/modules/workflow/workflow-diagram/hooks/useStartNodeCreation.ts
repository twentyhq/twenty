import { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { workflowCreateStepFromParentStepIdState } from '@/workflow/workflow-steps/states/workflowCreateStepFromParentStepIdState';
import { isDefined } from 'twenty-shared';

export const useStartNodeCreation = () => {
  const setWorkflowCreateStepFromParentStepId = useSetRecoilState(
    workflowCreateStepFromParentStepIdState,
  );
  const { openStepSelectInCommandMenu } = useWorkflowCommandMenu();

  const workflowId = useRecoilValue(workflowIdState);

  /**
   * This function is used in a context where dependencies shouldn't change much.
   * That's why its wrapped in a `useCallback` hook. Removing memoization might break the app unexpectedly.
   */
  const startNodeCreation = useCallback(
    (parentNodeId: string) => {
      setWorkflowCreateStepFromParentStepId(parentNodeId);

      if (isDefined(workflowId)) {
        openStepSelectInCommandMenu(workflowId);
        return;
      }
    },
    [
      setWorkflowCreateStepFromParentStepId,
      workflowId,
      openStepSelectInCommandMenu,
    ],
  );

  return {
    startNodeCreation,
  };
};
