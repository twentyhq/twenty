import { WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const markLeafNodes = (diagram: WorkflowDiagram): WorkflowDiagram => {
  const { nodes, edges } = diagram;

  const sourceNodeIds = new Set(edges.map((edge) => edge.source));

  const updatedNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      isLeafNode: !sourceNodeIds.has(node.id),
    },
  }));

  return {
    nodes: updatedNodes,
    edges: edges,
  };
};
