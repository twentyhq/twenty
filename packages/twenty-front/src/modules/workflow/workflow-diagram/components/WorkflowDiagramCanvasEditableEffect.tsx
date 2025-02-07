import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { EMPTY_TRIGGER_STEP_ID } from '@/workflow/workflow-diagram/constants/EmptyTriggerStepId';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { useTriggerNodeSelection } from '@/workflow/workflow-diagram/hooks/useTriggerNodeSelection';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import {
  WorkflowDiagramNode,
  WorkflowDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { isCreateStepNode } from '@/workflow/workflow-diagram/utils/isCreateStepNode';
import { useLingui } from '@lingui/react/macro';
import { OnSelectionChangeParams, useOnSelectionChange } from '@xyflow/react';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import { IconBolt, useIcons } from 'twenty-ui';

export const WorkflowDiagramCanvasEditableEffect = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { startNodeCreation } = useStartNodeCreation();

  const { openRightDrawer, closeRightDrawer } = useRightDrawer();
  const { closeCommandMenu } = useCommandMenu();

  const setHotkeyScope = useSetHotkeyScope();

  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const handleSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      const selectedNode = nodes[0] as WorkflowDiagramNode;
      const isClosingStep = isDefined(selectedNode) === false;

      setCommandMenuNavigationStack([]);

      if (isClosingStep) {
        closeRightDrawer();
        closeCommandMenu();
        return;
      }

      const isEmptyTriggerNode = selectedNode.type === EMPTY_TRIGGER_STEP_ID;
      if (isEmptyTriggerNode) {
        openRightDrawer(RightDrawerPages.WorkflowStepSelectTriggerType, {
          title: t`Trigger Type`,
          Icon: IconBolt,
        });

        return;
      }

      if (isCreateStepNode(selectedNode)) {
        startNodeCreation(selectedNode.data.parentNodeId);

        return;
      }

      const selectedNodeData = selectedNode.data as WorkflowDiagramStepNodeData;

      setWorkflowSelectedNode(selectedNode.id);
      setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
      openRightDrawer(RightDrawerPages.WorkflowStepEdit, {
        title: selectedNodeData.name,
        Icon: getIcon(getWorkflowNodeIconKey(selectedNodeData)),
      });
    },
    [
      setCommandMenuNavigationStack,
      setWorkflowSelectedNode,
      setHotkeyScope,
      openRightDrawer,
      getIcon,
      closeRightDrawer,
      closeCommandMenu,
      t,
      startNodeCreation,
    ],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  useTriggerNodeSelection();

  return null;
};
