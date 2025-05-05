import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowDiagramStatusComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramStatusComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { WorkflowRunDiagramNode } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { OnSelectionChangeParams, useOnSelectionChange } from '@xyflow/react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const WorkflowRunDiagramCanvasEffect = () => {
  const { getIcon } = useIcons();

  const { openWorkflowRunViewStepInCommandMenu } = useWorkflowCommandMenu();

  const workflowRunId = useWorkflowRunIdOrThrow();

  const workflowVisualizerWorkflowIdState = useRecoilComponentCallbackStateV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflowDiagramStatusState = useRecoilComponentCallbackStateV2(
    workflowDiagramStatusComponentState,
  );
  const workflowSelectedNodeState = useRecoilComponentCallbackStateV2(
    workflowSelectedNodeComponentState,
  );

  const handleSelectionChange = useRecoilCallback(
    ({ snapshot, set }) =>
      ({ nodes }: OnSelectionChangeParams) => {
        const workflowId = getSnapshotValue(
          snapshot,
          workflowVisualizerWorkflowIdState,
        );

        if (!isDefined(workflowId)) {
          throw new Error('Expected the workflowId to be defined.');
        }

        const workflowDiagramStatus = getSnapshotValue(
          snapshot,
          workflowDiagramStatusState,
        );

        // The `handleSelectionChange` function is called when the diagram initializes and
        // a node is selected. In this case, we don't want to execute the rest of this function.
        // We open the Side Panel® synchronously after ReactFlow is initialized and a node is selected,
        // animations perform better that way.
        if (workflowDiagramStatus !== 'done') {
          return;
        }

        const selectedNode = nodes[0] as WorkflowRunDiagramNode | undefined;

        if (!isDefined(selectedNode)) {
          return;
        }

        set(workflowSelectedNodeState, selectedNode.id);

        const selectedNodeData = selectedNode.data;

        openWorkflowRunViewStepInCommandMenu({
          workflowId,
          workflowRunId,
          title: selectedNodeData.name,
          icon: getIcon(getWorkflowNodeIconKey(selectedNodeData)),
          workflowSelectedNode: selectedNode.id,
          stepExecutionStatus: selectedNodeData.runStatus,
        });
      },
    [
      workflowVisualizerWorkflowIdState,
      workflowDiagramStatusState,
      workflowSelectedNodeState,
      openWorkflowRunViewStepInCommandMenu,
      workflowRunId,
      getIcon,
    ],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  return null;
};
