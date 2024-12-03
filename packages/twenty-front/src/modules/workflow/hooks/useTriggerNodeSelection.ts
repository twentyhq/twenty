import { workflowDiagramTriggerNodeSelectionState } from '@/workflow/states/workflowDiagramTriggerNodeSelectionState';
import {
  WorkflowDiagramEdge,
  WorkflowDiagramNode,
} from '@/workflow/types/WorkflowDiagram';
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

    reactflow.updateNode(workflowDiagramTriggerNodeSelection, {
      selected: true,
    });

    setWorkflowDiagramTriggerNodeSelection(undefined);
  }, [
    reactflow,
    setWorkflowDiagramTriggerNodeSelection,
    workflowDiagramTriggerNodeSelection,
  ]);
};
