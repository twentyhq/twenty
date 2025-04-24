import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowDiagramStatusComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramStatusComponentState';
import { workflowRunStepToOpenByDefaultComponentState } from '@/workflow/workflow-diagram/states/workflowRunStepToOpenByDefaultComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const useHandleWorkflowRunDiagramCanvasInit = () => {
  const { getIcon } = useIcons();

  const { openWorkflowRunViewStepInCommandMenu } = useWorkflowCommandMenu();
  const { isInRightDrawer } = useContext(ActionMenuContext);

  const workflowVisualizerWorkflowIdState = useRecoilComponentCallbackStateV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflowDiagramStatusState = useRecoilComponentCallbackStateV2(
    workflowDiagramStatusComponentState,
  );
  const workflowRunStepToOpenByDefaultState = useRecoilComponentCallbackStateV2(
    workflowRunStepToOpenByDefaultComponentState,
  );
  const workflowSelectedNodeState = useRecoilComponentCallbackStateV2(
    workflowSelectedNodeComponentState,
  );

  const handleWorkflowRunDiagramCanvasInit = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const workflowDiagramStatus = getSnapshotValue(
          snapshot,
          workflowDiagramStatusState,
        );

        if (workflowDiagramStatus !== 'computing-dimensions') {
          throw new Error(
            'Sequence error: reactflow should be considered initialized only when the workflow diagram status is computing-dimensions.',
          );
        }

        set(workflowDiagramStatusState, 'done');

        if (isInRightDrawer) {
          return;
        }

        const workflowStepToOpenByDefault = getSnapshotValue(
          snapshot,
          workflowRunStepToOpenByDefaultState,
        );

        if (isDefined(workflowStepToOpenByDefault)) {
          const workflowVisualizerWorkflowId = getSnapshotValue(
            snapshot,
            workflowVisualizerWorkflowIdState,
          );
          if (!isDefined(workflowVisualizerWorkflowId)) {
            throw new Error(
              'The workflow id must be set; ensure the workflow id is always set before rendering the workflow diagram.',
            );
          }

          set(workflowSelectedNodeState, workflowStepToOpenByDefault.id);

          openWorkflowRunViewStepInCommandMenu({
            workflowId: workflowVisualizerWorkflowId,
            title: workflowStepToOpenByDefault.data.name,
            icon: getIcon(
              getWorkflowNodeIconKey(workflowStepToOpenByDefault.data),
            ),
            workflowSelectedNode: workflowStepToOpenByDefault.id,
            stepExecutionStatus: workflowStepToOpenByDefault.data.runStatus,
          });

          set(workflowRunStepToOpenByDefaultState, undefined);
        }
      },
    [
      getIcon,
      isInRightDrawer,
      openWorkflowRunViewStepInCommandMenu,
      workflowVisualizerWorkflowIdState,
      workflowDiagramStatusState,
      workflowRunStepToOpenByDefaultState,
      workflowSelectedNodeState,
    ],
  );

  return {
    handleWorkflowRunDiagramCanvasInit,
  };
};
