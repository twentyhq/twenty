import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useStartNodeCreation } from '@/workflow/hooks/useStartNodeCreation';
import { useTriggerNodeSelection } from '@/workflow/hooks/useTriggerNodeSelection';
import { workflowSelectedNodeState } from '@/workflow/states/workflowSelectedNodeState';
import { WorkflowDiagramNode } from '@/workflow/types/WorkflowDiagram';
import { OnSelectionChangeParams, useOnSelectionChange } from '@xyflow/react';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

export const WorkflowDiagramCanvasEditableEffect = () => {
  const { startNodeCreation } = useStartNodeCreation();

  const { openRightDrawer, closeRightDrawer } = useRightDrawer();
  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);

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

  useTriggerNodeSelection();

  return null;
};
