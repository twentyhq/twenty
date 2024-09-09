import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useStartNodeCreation } from '@/workflow/hooks/useStartNodeCreation';
import { workflowDiagramTriggerNodeSelectionState } from '@/workflow/states/workflowDiagramTriggerNodeSelectionState';
import { workflowSelectedNodeState } from '@/workflow/states/workflowSelectedNodeState';
import {
  WorkflowDiagramEdge,
  WorkflowDiagramNode,
} from '@/workflow/types/WorkflowDiagram';
import {
  OnSelectionChangeParams,
  useOnSelectionChange,
  useReactFlow,
} from '@xyflow/react';
import { useCallback, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

export const WorkflowDiagramCanvasEffect = () => {
  const reactflow = useReactFlow<WorkflowDiagramNode, WorkflowDiagramEdge>();

  const { startNodeCreation } = useStartNodeCreation();

  const { openRightDrawer, closeRightDrawer } = useRightDrawer();
  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);

  const workflowDiagramTriggerNodeSelection = useRecoilValue(
    workflowDiagramTriggerNodeSelectionState,
  );

  const handleSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      const selectedNode = nodes[0] as WorkflowDiagramNode;
      const isClosingStep = isDefined(selectedNode) === false;

      if (isClosingStep) {
        closeRightDrawer();

        return;
      }

      const isCreateStepNode = selectedNode.type === 'create-step';
      if (isCreateStepNode) {
        if (selectedNode.data.nodeType !== 'create-step') {
          throw new Error('Expected selected node to be a create step node.');
        }

        startNodeCreation(selectedNode.data.parentNodeId);

        return;
      }

      setWorkflowSelectedNode(selectedNode.id);
      openRightDrawer(RightDrawerPages.WorkflowStepEdit);
    },
    [
      closeRightDrawer,
      openRightDrawer,
      setWorkflowSelectedNode,
      startNodeCreation,
    ],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  useEffect(() => {
    if (!isDefined(workflowDiagramTriggerNodeSelection)) {
      return;
    }

    reactflow.updateNode(workflowDiagramTriggerNodeSelection, {
      selected: true,
    });
  }, [reactflow, workflowDiagramTriggerNodeSelection]);

  return null;
};
