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

  /**
   * The callback executed when the selection state of nodes or edges changes.
   * It's called when a node or an edge is selected or unselected.
   *
   * Relying on this callback is safer than listing to click events as nodes and edges
   * can be selected in many ways, either via mouse click, tab key or even programatically.
   *
   * The callback is currently used to open right drawers for step creation or step editing.
   */
  const handleSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      const selectedNode = nodes[0] as WorkflowDiagramNode;
      const isClosingStep = isDefined(selectedNode) === false;

      if (isClosingStep === true) {
        closeRightDrawer();

        return;
      }

      const isCreateStepNode = selectedNode.type === 'create-step';
      if (isCreateStepNode === true) {
        if (selectedNode.data.nodeType !== 'create-step') {
          throw new Error('Expected selected node to be a create step node.');
        }

        startNodeCreation(selectedNode.data.parentNodeId);

        return;
      }

      setShowPageWorkflowSelectedNode(selectedNode.id);
      openRightDrawer(RightDrawerPages.WorkflowEditStep);
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

  /**
   * We can't access the reactflow instance everywhere, only in children components of the <Reactflow /> component,
   * so we use a useEffect and a Recoil state to trigger actions on the diagram, like programatically selecting a node.
   */
  useEffect(() => {
    if (isDefined(showPageWorkflowDiagramTriggerNodeSelection) === false) {
      return;
    }

    reactflow.updateNode(showPageWorkflowDiagramTriggerNodeSelection, {
      selected: true,
    });
  }, [reactflow, showPageWorkflowDiagramTriggerNodeSelection]);

  return null;
};
