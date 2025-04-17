import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { getIsInputTabDisabled } from '@/command-menu/pages/workflow/step/view-run/utils/getIsInputTabDisabled';
import { getIsOutputTabDisabled } from '@/command-menu/pages/workflow/step/view-run/utils/getIsOutputTabDisabled';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import {
  WorkflowDiagramNode,
  WorkflowDiagramRunStatus,
  WorkflowRunDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/constants/WorkflowRunStepSidePanelTabListComponentId';
import { WorkflowRunTabId } from '@/workflow/workflow-steps/types/WorkflowRunTabId';
import { isNull } from '@sniptt/guards';
import { OnSelectionChangeParams, useOnSelectionChange } from '@xyflow/react';
import { useCallback } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const WorkflowRunDiagramCanvasEffect = () => {
  const { getIcon } = useIcons();
  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);
  const { openWorkflowRunViewStepInCommandMenu } = useWorkflowCommandMenu();

  const workflowId = useRecoilValue(workflowIdState);

  const resetWorkflowRunRightDrawerTabIfNeeded = useRecoilCallback(
    ({ snapshot, set }) =>
      ({
        workflowSelectedNode,
        stepExecutionStatus,
      }: {
        workflowSelectedNode: string;
        stepExecutionStatus: WorkflowDiagramRunStatus;
      }) => {
        const activeWorkflowRunRightDrawerTab = getSnapshotValue(
          snapshot,
          activeTabIdComponentState.atomFamily({
            instanceId: WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID,
          }),
        ) as WorkflowRunTabId | null;

        const isInputTabDisabled = getIsInputTabDisabled({
          stepExecutionStatus,
          workflowSelectedNode,
        });
        const isOutputTabDisabled = getIsOutputTabDisabled({
          stepExecutionStatus,
        });

        if (isNull(activeWorkflowRunRightDrawerTab)) {
          const defaultTabId = isOutputTabDisabled
            ? WorkflowRunTabId.NODE
            : WorkflowRunTabId.OUTPUT;

          set(
            activeTabIdComponentState.atomFamily({
              instanceId: WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID,
            }),
            defaultTabId,
          );

          return;
        }

        if (
          (isInputTabDisabled &&
            activeWorkflowRunRightDrawerTab === WorkflowRunTabId.INPUT) ||
          (isOutputTabDisabled &&
            activeWorkflowRunRightDrawerTab === WorkflowRunTabId.OUTPUT)
        ) {
          set(
            activeTabIdComponentState.atomFamily({
              instanceId: WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID,
            }),
            WorkflowRunTabId.NODE,
          );
        }
      },
    [],
  );

  const handleSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      const selectedNode = nodes[0] as WorkflowDiagramNode | undefined;

      if (!isDefined(selectedNode)) {
        return;
      }

      setWorkflowSelectedNode(selectedNode.id);

      const selectedNodeData =
        selectedNode.data as WorkflowRunDiagramStepNodeData;

      if (isDefined(workflowId)) {
        openWorkflowRunViewStepInCommandMenu(
          workflowId,
          selectedNodeData.name,
          getIcon(getWorkflowNodeIconKey(selectedNodeData)),
        );

        resetWorkflowRunRightDrawerTabIfNeeded({
          workflowSelectedNode: selectedNode.id,
          stepExecutionStatus: selectedNodeData.runStatus,
        });
      }
    },
    [
      setWorkflowSelectedNode,
      resetWorkflowRunRightDrawerTabIfNeeded,
      workflowId,
      openWorkflowRunViewStepInCommandMenu,
      getIcon,
    ],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  return null;
};
