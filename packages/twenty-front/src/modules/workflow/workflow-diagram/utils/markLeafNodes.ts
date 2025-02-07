import {
  WorkflowDiagram,
  WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { isCreateStepNode } from '@/workflow/workflow-diagram/utils/isCreateStepNode';

export const markLeafNodes = ({
  nodes,
  edges,
}: WorkflowDiagram): WorkflowDiagram => {
  const sourceNodeIds = new Set(edges.map((edge) => edge.source));

  const updatedNodes = nodes.map((node) => {
    if (isCreateStepNode(node)) {
      return node;
    }

    return {
      ...node,
      data: {
        ...node.data,
        isLeafNode: !sourceNodeIds.has(node.id),
      },
    };
  });

  return {
    nodes: updatedNodes as WorkflowDiagramNode[],
    edges,
  };
};
