import { workflowDiagramTriggerNodeSelectionState } from '@/workflow/workflow-diagram/states/workflowDiagramTriggerNodeSelectionState';
import {
  WorkflowDiagramEdge,
  WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useReactFlow } from '@xyflow/react';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useTriggerNodeSelection = () => {
  const reactflow = useReactFlow<WorkflowDiagramNode, WorkflowDiagramEdge>();

  const [
    workflowDiagramTriggerNodeSelection,
    setWorkflowDiagramTriggerNodeSelection,
  ] = useRecoilState(workflowDiagramTriggerNodeSelectionState);

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
