import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useSidePanelWorkflowNavigation } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type StartNodeCreationParams } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useStartNodeCreation = () => {
  const { commandMenuContextApi } = useContext(CommandMenuContext);
  const isInSidePanel = commandMenuContextApi.isInSidePanel;

  const [workflowInsertStepIds, setWorkflowInsertStepIds] =
    useAtomComponentState(workflowInsertStepIdsComponentState);

  const setWorkflowSelectedNode = useSetAtomComponentState(
    workflowSelectedNodeComponentState,
  );

  const { openWorkflowCreateStepInSidePanel } =
    useSidePanelWorkflowNavigation();

  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const setSidePanelNavigationStack = useSetAtomState(
    sidePanelNavigationStackState,
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

      if (!isInSidePanel) {
        setSidePanelNavigationStack([]);
      }

      openWorkflowCreateStepInSidePanel(workflowVisualizerWorkflowId);
    },
    [
      setWorkflowInsertStepIds,
      setWorkflowSelectedNode,
      workflowVisualizerWorkflowId,
      isInSidePanel,
      openWorkflowCreateStepInSidePanel,
      setSidePanelNavigationStack,
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
