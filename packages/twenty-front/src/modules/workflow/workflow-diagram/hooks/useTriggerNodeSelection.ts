import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { workflowDiagramTriggerNodeSelectionComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramTriggerNodeSelectionComponentState';
import {
  WorkflowDiagramEdge,
  WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useReactFlow } from '@xyflow/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useTriggerNodeSelection = () => {
  const reactflow = useReactFlow<WorkflowDiagramNode, WorkflowDiagramEdge>();

  const [
    workflowDiagramTriggerNodeSelection,
    setWorkflowDiagramTriggerNodeSelection,
  ] = useRecoilComponentStateV2(
    workflowDiagramTriggerNodeSelectionComponentState,
  );

  useEffect(() => {
    if (!isDefined(workflowDiagramTriggerNodeSelection)) {
      return;
    }

    reactflow.setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        selected: workflowDiagramTriggerNodeSelection === node.id,
      })),
    );

    setWorkflowDiagramTriggerNodeSelection(undefined);
  }, [
    reactflow,
    setWorkflowDiagramTriggerNodeSelection,
    workflowDiagramTriggerNodeSelection,
  ]);
};
