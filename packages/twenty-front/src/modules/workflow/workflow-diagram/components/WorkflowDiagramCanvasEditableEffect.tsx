import { useCallback, useContext } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';

import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { workflowIdState } from '@/workflow/states/workflowIdState';
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
import { OnSelectionChangeParams, useOnSelectionChange } from '@xyflow/react';
import { isDefined } from 'twenty-shared';
import { useIcons } from 'twenty-ui';

export const WorkflowDiagramCanvasEditableEffect = () => {
  const { getIcon } = useIcons();
  const { startNodeCreation } = useStartNodeCreation();

  const {
    openWorkflowTriggerTypeInCommandMenu,
    openWorkflowEditStepInCommandMenu,
  } = useWorkflowCommandMenu();

  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const workflowId = useRecoilValue(workflowIdState);

  const handleSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      const selectedNode = nodes[0] as WorkflowDiagramNode | undefined;

      if (!isInRightDrawer) {
        setCommandMenuNavigationStack([]);
      }

      if (!isDefined(selectedNode)) {
        return;
      }

      const isEmptyTriggerNode = selectedNode.type === EMPTY_TRIGGER_STEP_ID;
      if (isEmptyTriggerNode) {
        if (isDefined(workflowId)) {
          openWorkflowTriggerTypeInCommandMenu(workflowId);
          return;
        }

        return;
      }

      if (isCreateStepNode(selectedNode)) {
        startNodeCreation(selectedNode.data.parentNodeId);

        return;
      }

      const selectedNodeData = selectedNode.data as WorkflowDiagramStepNodeData;

      setWorkflowSelectedNode(selectedNode.id);

      if (isDefined(workflowId)) {
        openWorkflowEditStepInCommandMenu(
          workflowId,
          selectedNodeData.name,
          getIcon(getWorkflowNodeIconKey(selectedNodeData)),
        );

        return;
      }
    },
    [
      isInRightDrawer,
      setCommandMenuNavigationStack,
      workflowId,
      openWorkflowTriggerTypeInCommandMenu,
      startNodeCreation,
      openWorkflowEditStepInCommandMenu,
      getIcon,
      setWorkflowSelectedNode,
    ],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  useTriggerNodeSelection();

  return null;
};
