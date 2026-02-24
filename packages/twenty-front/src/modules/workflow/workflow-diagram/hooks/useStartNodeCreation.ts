import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type StartNodeCreationParams } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useStartNodeCreation = () => {
  const { isInRightDrawer } = useContext(ActionMenuContext);

  const [workflowInsertStepIds, setWorkflowInsertStepIds] =
    useRecoilComponentStateV2(workflowInsertStepIdsComponentState);

  const setWorkflowSelectedNode = useSetRecoilComponentStateV2(
    workflowSelectedNodeComponentState,
  );

  const { openWorkflowCreateStepInCommandMenu } = useWorkflowCommandMenu();

  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );

  const setCommandMenuNavigationStack = useSetRecoilStateV2(
    commandMenuNavigationStackState,
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
      connectionOptions,
    }: StartNodeCreationParams) => {
      setWorkflowInsertStepIds({
        parentStepId,
        nextStepId,
        position,
        connectionOptions,
      });

      setWorkflowSelectedNode(undefined);

      if (!isDefined(workflowVisualizerWorkflowId)) {
        return;
      }

      if (!isInRightDrawer) {
        setCommandMenuNavigationStack([]);
      }

      openWorkflowCreateStepInCommandMenu(workflowVisualizerWorkflowId);
    },
    [
      setWorkflowInsertStepIds,
      setWorkflowSelectedNode,
      workflowVisualizerWorkflowId,
      isInRightDrawer,
      openWorkflowCreateStepInCommandMenu,
      setCommandMenuNavigationStack,
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
