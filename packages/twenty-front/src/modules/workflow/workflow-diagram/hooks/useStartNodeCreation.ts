import { useCallback } from 'react';

import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useStartNodeCreation = () => {
  const setWorkflowInsertStepIds = useSetRecoilComponentStateV2(
    workflowInsertStepIdsComponentState,
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
    ({
      parentStepId,
      nextStepId,
      position,
    }: {
      parentStepId: string | undefined;
      nextStepId: string | undefined;
      position?: { x: number; y: number };
    }) => {
      setWorkflowInsertStepIds({ parentStepId, nextStepId, position });

      if (isDefined(workflowVisualizerWorkflowId)) {
        openStepSelectInCommandMenu(workflowVisualizerWorkflowId);
        return;
      }
    },
    [
      setWorkflowInsertStepIds,
      workflowVisualizerWorkflowId,
      openStepSelectInCommandMenu,
    ],
  );

  return {
    startNodeCreation,
  };
};
