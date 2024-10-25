import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { CREATE_STEP_STEP_ID } from '@/workflow/constants/CreateStepStepId';
import { EMPTY_TRIGGER_STEP_ID } from '@/workflow/constants/EmptyTriggerStepId';
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
  const setHotkeyScope = useSetHotkeyScope();

  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);

  const handleSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      const selectedNode = nodes[0] as WorkflowDiagramNode;
      const isClosingStep = isDefined(selectedNode) === false;

      if (isClosingStep) {
        closeRightDrawer();

        return;
      }

      const isEmptyTriggerNode = selectedNode.type === EMPTY_TRIGGER_STEP_ID;
      if (isEmptyTriggerNode) {
        openRightDrawer(RightDrawerPages.WorkflowStepSelectTriggerType);

        return;
      }

      const isCreateStepNode = selectedNode.type === CREATE_STEP_STEP_ID;
      if (isCreateStepNode) {
        if (selectedNode.data.nodeType !== 'create-step') {
          throw new Error('Expected selected node to be a create step node.');
        }

        startNodeCreation(selectedNode.data.parentNodeId);

        return;
      }

      setWorkflowSelectedNode(selectedNode.id);
      setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
      openRightDrawer(RightDrawerPages.WorkflowStepEdit);
    },
    [
      setHotkeyScope,
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
