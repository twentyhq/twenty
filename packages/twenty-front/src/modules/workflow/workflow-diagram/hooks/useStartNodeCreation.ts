import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { type WorkflowStepConnectionOptions } from '@/workflow/workflow-diagram/workflow-iterator/types/WorkflowStepConnectionOptions';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { useStoreApi } from '@xyflow/react';
import { useCallback, useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useStartNodeCreation = () => {
  const { isInRightDrawer } = useContext(ActionMenuContext);

  const [workflowInsertStepIds, setWorkflowInsertStepIds] =
    useRecoilComponentState(workflowInsertStepIdsComponentState);

  const { openWorkflowCreateStepInCommandMenu } = useWorkflowCommandMenu();

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const reactFlowStoreApi = useStoreApi();

  const scheduleConnectionReset = useCallback(() => {
    const run = () => {
      reactFlowStoreApi.getState().cancelConnection?.();

      if (
        typeof document !== 'undefined' &&
        typeof PointerEvent !== 'undefined'
      ) {
        document.dispatchEvent(
          new PointerEvent('pointerup', { bubbles: true }),
        );
      }
    };

    if (
      typeof window !== 'undefined' &&
      typeof window.requestAnimationFrame === 'function'
    ) {
      window.requestAnimationFrame(run);
    } else {
      run();
    }
  }, [reactFlowStoreApi]);

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
      sourceHandleId,
    }: {
      parentStepId: string | undefined;
      nextStepId: string | undefined;
      position?: { x: number; y: number };
      connectionOptions?: WorkflowStepConnectionOptions;
      sourceHandleId?: string;
    }) => {
      setWorkflowInsertStepIds({
        parentStepId,
        nextStepId,
        position,
        connectionOptions,
        sourceHandleId,
      });

      scheduleConnectionReset();

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
      workflowVisualizerWorkflowId,
      isInRightDrawer,
      openWorkflowCreateStepInCommandMenu,
      setCommandMenuNavigationStack,
      scheduleConnectionReset,
    ],
  );

  const isNodeCreationStarted = ({
    parentStepId,
    nextStepId,
    sourceHandleId,
  }: {
    parentStepId?: string;
    nextStepId?: string;
    sourceHandleId?: string;
  }) => {
    return (
      workflowInsertStepIds.parentStepId === parentStepId &&
      workflowInsertStepIds.nextStepId === nextStepId &&
      (isDefined(sourceHandleId)
        ? workflowInsertStepIds.sourceHandleId === sourceHandleId
        : true)
    );
  };

  return {
    startNodeCreation,
    isNodeCreationStarted,
  };
};
