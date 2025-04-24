import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { workflowDiagramStatusState } from '@/workflow/workflow-diagram/states/workflowDiagramStatusState';
import { workflowRunStepToOpenByDefaultState } from '@/workflow/workflow-diagram/states/workflowRunStepToOpenByDefaultState';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const useHandleWorkflowRunDiagramCanvasInit = () => {
  const { getIcon } = useIcons();

  const { openWorkflowRunViewStepInCommandMenu } = useWorkflowCommandMenu();
  const { isInRightDrawer } = useContext(ActionMenuContext);

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
          const workflowId = getSnapshotValue(snapshot, workflowIdState);
          if (!isDefined(workflowId)) {
            throw new Error(
              'The workflow id must be set; ensure the workflow id is always set before rendering the workflow diagram.',
            );
          }

          set(workflowSelectedNodeState, workflowStepToOpenByDefault.id);

          openWorkflowRunViewStepInCommandMenu({
            workflowId,
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
    [getIcon, isInRightDrawer, openWorkflowRunViewStepInCommandMenu],
  );

  return {
    handleWorkflowRunDiagramCanvasInit,
  };
};
