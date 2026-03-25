import {
  type WorkflowDiagramNode,
  type WorkflowDiagramStepNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const isStepNode = (
  node: WorkflowDiagramNode,
): node is WorkflowDiagramStepNode => {
  return node.data.nodeType === 'trigger' || node.data.nodeType === 'action';
};
