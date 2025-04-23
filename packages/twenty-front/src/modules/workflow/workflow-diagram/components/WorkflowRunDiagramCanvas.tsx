import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { WorkflowRunStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramDefaultEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdge';
import { WorkflowDiagramStepNodeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeReadonly';
import { WorkflowDiagramSuccessEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramSuccessEdge';
import { WorkflowRunDiagramCanvasEffect } from '@/workflow/workflow-diagram/components/WorkflowRunDiagramCanvasEffect';
import { workflowDiagramStatusState } from '@/workflow/workflow-diagram/states/workflowDiagramStatusState';
import { workflowRunStepToOpenByDefaultState } from '@/workflow/workflow-diagram/states/workflowRunStepToOpenByDefaultState';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { getWorkflowRunStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowRunStatusTagProps';
import { ReactFlowProvider } from '@xyflow/react';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const WorkflowRunDiagramCanvas = ({
  workflowRunStatus,
}: {
  workflowRunStatus: WorkflowRunStatus;
}) => {
  const { getIcon } = useIcons();

  const tagProps = getWorkflowRunStatusTagProps({
    workflowRunStatus,
  });

  const { openWorkflowRunViewStepInCommandMenu } = useWorkflowCommandMenu();
  const { isInRightDrawer } = useContext(ActionMenuContext);

  const handleInit = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const workflowDiagramStatus = getSnapshotValue(
          snapshot,
          workflowDiagramStatusState,
        );

        if (workflowDiagramStatus !== 'computing-dimensions') {
          return;
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

  return (
    <ReactFlowProvider>
      <WorkflowDiagramCanvasBase
        nodeTypes={{
          default: WorkflowDiagramStepNodeReadonly,
        }}
        edgeTypes={{
          default: WorkflowDiagramDefaultEdge,
          success: WorkflowDiagramSuccessEdge,
        }}
        tagContainerTestId="workflow-run-status"
        tagColor={tagProps.color}
        tagText={tagProps.text}
        onInit={handleInit}
      />

      <WorkflowRunDiagramCanvasEffect />
    </ReactFlowProvider>
  );
};
