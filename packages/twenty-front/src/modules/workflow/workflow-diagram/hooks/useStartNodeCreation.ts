import { useCallback } from 'react';

import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { isDefined } from 'twenty-shared/utils';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';

export const useStartNodeCreation = () => {
  const [workflowInsertStepIds, setWorkflowInsertStepIds] =
    useRecoilComponentStateV2(workflowInsertStepIdsComponentState);

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

  const isNodeCreationStarted = ({
    parentStepId,
    nextStepId,
  }: {
    parentStepId?: string;
    nextStepId?: string;
  }) => {
    return (
      workflowInsertStepIds.parentStepId === parentStepId &&
      workflowInsertStepIds.nextStepId === nextStepId
    );
  };

  return {
    startNodeCreation,
    isNodeCreationStarted,
  };
};
