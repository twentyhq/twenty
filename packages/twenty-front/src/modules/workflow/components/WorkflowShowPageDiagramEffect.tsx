import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { showPageWorkflowDiagramTriggerNodeSelectionState } from '@/workflow/states/showPageWorkflowDiagramTriggerNodeSelectionState';
import { showPageWorkflowSelectedNodeState } from '@/workflow/states/showPageWorkflowSelectedNodeState';
import {
  OnSelectionChangeParams,
  useOnSelectionChange,
  useReactFlow,
} from '@xyflow/react';
import { useCallback, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

export const WorkflowShowPageDiagramEffect = () => {
  const reactflow = useReactFlow();

  const { openRightDrawer, closeRightDrawer } = useRightDrawer();
  const setShowPageWorkflowSelectedNode = useSetRecoilState(
    showPageWorkflowSelectedNodeState,
  );

  const showPageWorkflowDiagramTriggerNodeSelection = useRecoilValue(
    showPageWorkflowDiagramTriggerNodeSelectionState,
  );

  const handleSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      const selectedNode = nodes[0];
      const isClosingStep = isDefined(selectedNode) === false;

      if (isClosingStep === true) {
        closeRightDrawer();

        return;
      }

      const isCustomNode = isDefined(selectedNode.type) === true;
      if (isCustomNode === true) {
        // For now, custom nodes implement a custom click handler and we shouldn't override their behavior.

        return;
      }

      setShowPageWorkflowSelectedNode(selectedNode.id);
      openRightDrawer(RightDrawerPages.WorkflowEditStep);
    },
    [closeRightDrawer, openRightDrawer, setShowPageWorkflowSelectedNode],
  );

  useOnSelectionChange({
    onChange: handleSelectionChange,
  });

  useEffect(() => {
    if (isDefined(showPageWorkflowDiagramTriggerNodeSelection) === false) {
      return;
    }

    reactflow.updateNode(showPageWorkflowDiagramTriggerNodeSelection, {
      selected: true,
    });
  }, [reactflow, showPageWorkflowDiagramTriggerNodeSelection]);

  return null;
};
