import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { workflowDiagramStatusState } from '@/workflow/workflow-diagram/states/workflowDiagramStatusState';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { WorkflowRunDiagramNode } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { OnSelectionChangeParams, useOnSelectionChange } from '@xyflow/react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const WorkflowRunDiagramCanvasEffect = () => {
  const { getIcon } = useIcons();

  const { openWorkflowRunViewStepInCommandMenu } = useWorkflowCommandMenu();

  const handleSelectionChange = useRecoilCallback(
    ({ snapshot, set }) =>
      ({ nodes }: OnSelectionChangeParams) => {
        const workflowId = getSnapshotValue(snapshot, workflowIdState);

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
          title: selectedNodeData.name,
          icon: getIcon(getWorkflowNodeIconKey(selectedNodeData)),
          workflowSelectedNode: selectedNode.id,
          stepExecutionStatus: selectedNodeData.runStatus,
        });
      },
    [getIcon, openWorkflowRunViewStepInCommandMenu],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  return null;
};
