import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type StartNodeCreationParams } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useStartNodeCreation = () => {
  const { isInRightDrawer } = useContext(ActionMenuContext);

  const [workflowInsertStepIds, setWorkflowInsertStepIds] =
    useAtomComponentState(workflowInsertStepIdsComponentState);

  const setWorkflowSelectedNode = useSetAtomComponentState(
    workflowSelectedNodeComponentState,
  );

  const { openWorkflowCreateStepInCommandMenu } = useWorkflowCommandMenu();

  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const setCommandMenuNavigationStack = useSetAtomState(
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
