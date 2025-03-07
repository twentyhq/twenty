import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useTabListStates } from '@/ui/layout/tab/hooks/internal/useTabListStates';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import {
  WorkflowDiagramNode,
  WorkflowDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/constants/WorkflowRunStepSidePanelTabListComponentId';
import { WorkflowRunTabId } from '@/workflow/workflow-steps/types/WorkflowRunTabId';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { OnSelectionChangeParams, useOnSelectionChange } from '@xyflow/react';
import { useCallback } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import { useIcons } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const WorkflowRunDiagramCanvasEffect = () => {
  const { getIcon } = useIcons();
  const { openRightDrawer, closeRightDrawer } = useRightDrawer();
  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);
  const setHotkeyScope = useSetHotkeyScope();
  const { openWorkflowViewRunStepInCommandMenu } = useCommandMenu();
  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  const workflowId = useRecoilValue(workflowIdState);

  const { activeTabIdState: workflowRunRightDrawerListActiveTabIdState } =
    useTabListStates({
      tabListScopeId: WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID,
    });

  const goBackToFirstWorkflowRunRightDrawerTabIfNeeded = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const activeWorkflowRunRightDrawerTab = getSnapshotValue(
          snapshot,
          workflowRunRightDrawerListActiveTabIdState,
        ) as WorkflowRunTabId | null;

        if (
          activeWorkflowRunRightDrawerTab === 'input' ||
          activeWorkflowRunRightDrawerTab === 'output'
        ) {
          set(workflowRunRightDrawerListActiveTabIdState, 'node');
        }
      },
    [workflowRunRightDrawerListActiveTabIdState],
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
      setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });

      const selectedNodeData = selectedNode.data as WorkflowDiagramStepNodeData;

      if (
        selectedNode.id === TRIGGER_STEP_ID ||
        selectedNodeData.runStatus === 'not-executed' ||
        selectedNodeData.runStatus === 'running'
      ) {
        goBackToFirstWorkflowRunRightDrawerTabIfNeeded();
      }

      if (isCommandMenuV2Enabled && isDefined(workflowId)) {
        openWorkflowViewRunStepInCommandMenu(
          workflowId,
          selectedNodeData.name,
          getIcon(getWorkflowNodeIconKey(selectedNodeData)),
        );

        return;
      }

      openRightDrawer(RightDrawerPages.WorkflowRunStepView, {
        title: selectedNodeData.name,
        Icon: getIcon(getWorkflowNodeIconKey(selectedNodeData)),
      });
    },
    [
      setWorkflowSelectedNode,
      setHotkeyScope,
      isCommandMenuV2Enabled,
      workflowId,
      openRightDrawer,
      getIcon,
      closeRightDrawer,
      goBackToFirstWorkflowRunRightDrawerTabIfNeeded,
      openWorkflowViewRunStepInCommandMenu,
    ],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  return null;
};
