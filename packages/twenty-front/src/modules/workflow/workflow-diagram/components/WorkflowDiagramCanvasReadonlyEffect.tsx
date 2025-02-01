import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { EMPTY_TRIGGER_STEP_ID } from '@/workflow/workflow-diagram/constants/EmptyTriggerStepId';
import { useTriggerNodeSelection } from '@/workflow/workflow-diagram/hooks/useTriggerNodeSelection';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import {
  WorkflowDiagramNode,
  WorkflowDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { OnSelectionChangeParams, useOnSelectionChange } from '@xyflow/react';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import { useIcons } from 'twenty-ui';

export const WorkflowDiagramCanvasReadonlyEffect = () => {
  const { getIcon } = useIcons();
  const { openRightDrawer, closeRightDrawer } = useRightDrawer();
  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);
  const setHotkeyScope = useSetHotkeyScope();
  const { closeCommandMenu } = useCommandMenu();

  const handleSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      const selectedNode = nodes[0] as WorkflowDiagramNode;
      const isClosingStep = isDefined(selectedNode) === false;

      if (isClosingStep || selectedNode.type === EMPTY_TRIGGER_STEP_ID) {
        closeRightDrawer();
        closeCommandMenu();
        return;
      }

      setWorkflowSelectedNode(selectedNode.id);
      setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });

      const selectedNodeData = selectedNode.data as WorkflowDiagramStepNodeData;

      openRightDrawer(RightDrawerPages.WorkflowStepView, {
        title: selectedNodeData.name,
        Icon: getIcon(getWorkflowNodeIconKey(selectedNodeData)),
      });
    },
    [
      setWorkflowSelectedNode,
      setHotkeyScope,
      openRightDrawer,
      closeRightDrawer,
      closeCommandMenu,
      getIcon,
    ],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  useTriggerNodeSelection();

  return null;
};
