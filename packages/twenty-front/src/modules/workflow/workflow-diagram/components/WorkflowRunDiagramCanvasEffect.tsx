import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { workflowDiagramStatusState } from '@/workflow/workflow-diagram/states/workflowDiagramStatusState';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import {
  WorkflowDiagramNode,
  WorkflowRunDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { OnSelectionChangeParams, useOnSelectionChange } from '@xyflow/react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const WorkflowRunDiagramCanvasEffect = () => {
  const { getIcon } = useIcons();

  const workflowId = useRecoilValue(workflowIdState);
  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);
  const { openWorkflowRunViewStepInCommandMenu } = useWorkflowCommandMenu();

  const handleSelectionChange = useRecoilCallback(
    ({ snapshot }) =>
      ({ nodes }: OnSelectionChangeParams) => {
        const workflowDiagramStatus = getSnapshotValue(
          snapshot,
          workflowDiagramStatusState,
        );

        console.log('handle selection change', {
          nodes,
          workflowDiagramStatus,
        });

        if (workflowDiagramStatus !== 'done') {
          console.log('handle selection change [aborted]');

          return;
        }

        const selectedNode = nodes[0] as WorkflowDiagramNode | undefined;

        if (!isDefined(selectedNode)) {
          return;
        }

        setWorkflowSelectedNode(selectedNode.id);

        const selectedNodeData =
          selectedNode.data as WorkflowRunDiagramStepNodeData;

        if (isDefined(workflowId)) {
          openWorkflowRunViewStepInCommandMenu({
            workflowId,
            title: selectedNodeData.name,
            icon: getIcon(getWorkflowNodeIconKey(selectedNodeData)),
            workflowSelectedNode: selectedNode.id,
            stepExecutionStatus: selectedNodeData.runStatus,
          });
        }
      },
    [
      getIcon,
      openWorkflowRunViewStepInCommandMenu,
      setWorkflowSelectedNode,
      workflowId,
    ],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  return null;
};
