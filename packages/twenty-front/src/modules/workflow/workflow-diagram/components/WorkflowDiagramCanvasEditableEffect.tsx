import { useCallback, useContext } from 'react';
import { useSetRecoilState } from 'recoil';

import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';

import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { EMPTY_TRIGGER_STEP_ID } from '@/workflow/workflow-diagram/constants/EmptyTriggerStepId';
import { useTriggerNodeSelection } from '@/workflow/workflow-diagram/hooks/useTriggerNodeSelection';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import {
  WorkflowDiagramNode,
  WorkflowDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { OnSelectionChangeParams, useOnSelectionChange } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { useEdgeSelected } from '@/workflow/workflow-diagram/hooks/useEdgeSelected';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';

export const WorkflowDiagramCanvasEditableEffect = () => {
  const { getIcon } = useIcons();

  const {
    openWorkflowTriggerTypeInCommandMenu,
    openWorkflowEditStepInCommandMenu,
  } = useWorkflowCommandMenu();

  const { setEdgeSelected, clearEdgeSelection } = useEdgeSelected();

  const isWorkflowBranchEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_BRANCH_ENABLED,
  );

  const setWorkflowSelectedNode = useSetRecoilComponentState(
    workflowSelectedNodeComponentState,
  );

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const handleSelectedNodes = useCallback(
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
        if (isDefined(workflowVisualizerWorkflowId)) {
          openWorkflowTriggerTypeInCommandMenu(workflowVisualizerWorkflowId);
          return;
        }

        return;
      }

      const selectedNodeData = selectedNode.data as WorkflowDiagramStepNodeData;

      setWorkflowSelectedNode(selectedNode.id);

      if (isDefined(workflowVisualizerWorkflowId)) {
        openWorkflowEditStepInCommandMenu(
          workflowVisualizerWorkflowId,
          selectedNodeData.name,
          getIcon(getWorkflowNodeIconKey(selectedNodeData)),
        );

        return;
      }
    },
    [
      isInRightDrawer,
      setCommandMenuNavigationStack,
      workflowVisualizerWorkflowId,
      openWorkflowTriggerTypeInCommandMenu,
      openWorkflowEditStepInCommandMenu,
      getIcon,
      setWorkflowSelectedNode,
    ],
  );

  const handleSelectedEdges = useCallback(
    ({ edges }: OnSelectionChangeParams) => {
      if (!isWorkflowBranchEnabled) {
        return;
      }

      const selectedEdge = edges?.[0];

      if (!isDefined(selectedEdge)) {
        clearEdgeSelection();
        return;
      }

      setEdgeSelected({
        source: selectedEdge.source,
        target: selectedEdge.target,
      });
    },
    [isWorkflowBranchEnabled, setEdgeSelected, clearEdgeSelection],
  );

  const handleSelectionChange = useCallback(
    (onSelectionChangeParams: OnSelectionChangeParams) => {
      handleSelectedNodes(onSelectionChangeParams);
      handleSelectedEdges(onSelectionChangeParams);
    },
    [handleSelectedNodes, handleSelectedEdges],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  useTriggerNodeSelection();

  return null;
};
