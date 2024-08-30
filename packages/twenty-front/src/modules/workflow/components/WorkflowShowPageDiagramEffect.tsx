import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useStartNodeCreation } from '@/workflow/hooks/useStartNodeCreation';
import { showPageWorkflowDiagramTriggerNodeSelectionState } from '@/workflow/states/showPageWorkflowDiagramTriggerNodeSelectionState';
import { showPageWorkflowSelectedNodeState } from '@/workflow/states/showPageWorkflowSelectedNodeState';
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

export const WorkflowShowPageDiagramEffect = () => {
  const reactflow = useReactFlow<WorkflowDiagramNode, WorkflowDiagramEdge>();

  const { startNodeCreation } = useStartNodeCreation();

  const { openRightDrawer, closeRightDrawer } = useRightDrawer();
  const setShowPageWorkflowSelectedNode = useSetRecoilState(
    showPageWorkflowSelectedNodeState,
  );

  const showPageWorkflowDiagramTriggerNodeSelection = useRecoilValue(
    showPageWorkflowDiagramTriggerNodeSelectionState,
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

      setShowPageWorkflowSelectedNode(selectedNode.id);
      openRightDrawer(RightDrawerPages.WorkflowStepEdit);
    },
    [
      closeRightDrawer,
      openRightDrawer,
      setShowPageWorkflowSelectedNode,
      startNodeCreation,
    ],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  useEffect(() => {
    if (!isDefined(showPageWorkflowDiagramTriggerNodeSelection)) {
      return;
    }

    reactflow.updateNode(showPageWorkflowDiagramTriggerNodeSelection, {
      selected: true,
    });
  }, [reactflow, showPageWorkflowDiagramTriggerNodeSelection]);

  return null;
};
