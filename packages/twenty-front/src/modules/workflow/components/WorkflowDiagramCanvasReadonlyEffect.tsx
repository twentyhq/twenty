import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
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

export const WorkflowDiagramCanvasReadonlyEffect = () => {
  const reactflow = useReactFlow<WorkflowDiagramNode, WorkflowDiagramEdge>();

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

      setWorkflowSelectedNode(selectedNode.id);
      openRightDrawer(RightDrawerPages.WorkflowStepView);
    },
    [closeRightDrawer, openRightDrawer, setWorkflowSelectedNode],
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
