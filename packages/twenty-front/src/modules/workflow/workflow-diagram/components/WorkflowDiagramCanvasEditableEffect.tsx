import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
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
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { OnSelectionChangeParams, useOnSelectionChange } from '@xyflow/react';
import { useCallback, useContext } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import { IconBolt, useIcons } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const WorkflowDiagramCanvasEditableEffect = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { startNodeCreation } = useStartNodeCreation();

  const { openRightDrawer, closeRightDrawer } = useRightDrawer();
  const {
    openWorkflowTriggerTypeInCommandMenu,
    openWorkflowEditStepInCommandMenu,
  } = useCommandMenu();

  const setHotkeyScope = useSetHotkeyScope();

  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const workflowId = useRecoilValue(workflowIdState);

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  const handleSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      const selectedNode = nodes[0] as WorkflowDiagramNode;
      const isClosingStep = isDefined(selectedNode) === false;

      if (!isInRightDrawer) {
        setCommandMenuNavigationStack([]);
      }

      if (isClosingStep) {
        closeRightDrawer();
        return;
      }

      const isEmptyTriggerNode = selectedNode.type === EMPTY_TRIGGER_STEP_ID;
      if (isEmptyTriggerNode) {
        if (isCommandMenuV2Enabled && isDefined(workflowId)) {
          openWorkflowTriggerTypeInCommandMenu(workflowId);
          return;
        }

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

      if (isCommandMenuV2Enabled && isDefined(workflowId)) {
        openWorkflowEditStepInCommandMenu(
          workflowId,
          selectedNodeData.name,
          getIcon(getWorkflowNodeIconKey(selectedNodeData)),
        );

        return;
      }

      setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
      openRightDrawer(RightDrawerPages.WorkflowStepEdit, {
        title: selectedNodeData.name,
        Icon: getIcon(getWorkflowNodeIconKey(selectedNodeData)),
      });
    },
    [
      isInRightDrawer,
      isCommandMenuV2Enabled,
      setCommandMenuNavigationStack,
      closeRightDrawer,
      workflowId,
      openRightDrawer,
      t,
      openWorkflowTriggerTypeInCommandMenu,
      startNodeCreation,
      openWorkflowEditStepInCommandMenu,
      getIcon,
      setWorkflowSelectedNode,
      setHotkeyScope,
    ],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  useTriggerNodeSelection();

  return null;
};
