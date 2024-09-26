import { WorkflowDiagram } from '@/workflow/types/WorkflowDiagram';

export const mergeWorkflowDiagrams = (
  previousDiagram: WorkflowDiagram,
  nextDiagram: WorkflowDiagram,
): WorkflowDiagram => {
  const lastNodes = nextDiagram.nodes.map((nextNode) => {
    const previousNode = previousDiagram.nodes.find(
      (previousNode) => previousNode.id === nextNode.id,
    );

    return {
      ...previousNode,
      ...nextNode,
    };
  });
  const lastEdges = nextDiagram.edges.map((nextEdge) => {
    const previousEdge = previousDiagram.edges.find(
      (previousEdge) => previousEdge.id === nextEdge.id,
    );

    return {
      ...previousEdge,
      ...nextEdge,
    };
  });

  return {
    nodes: lastNodes,
    edges: lastEdges,
  };
};
