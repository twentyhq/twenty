import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useTriggerNodeSelection } from '@/workflow/hooks/useTriggerNodeSelection';
import { workflowSelectedNodeState } from '@/workflow/states/workflowSelectedNodeState';
import { WorkflowDiagramNode } from '@/workflow/types/WorkflowDiagram';
import { OnSelectionChangeParams, useOnSelectionChange } from '@xyflow/react';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

export const WorkflowDiagramCanvasReadonlyEffect = () => {
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

      setWorkflowSelectedNode(selectedNode.id);
      openRightDrawer(RightDrawerPages.WorkflowStepView);
    },
    [closeRightDrawer, openRightDrawer, setWorkflowSelectedNode],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  useTriggerNodeSelection();

  return null;
};
