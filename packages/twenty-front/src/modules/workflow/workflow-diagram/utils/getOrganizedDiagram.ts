import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { computeWorkflowLayout } from 'twenty-shared/workflow';

export const getOrganizedDiagram = (
  diagram: WorkflowDiagram,
): WorkflowDiagram => {
  const positions = computeWorkflowLayout({
    nodes: diagram.nodes.map((node) => ({
      id: node.id,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    })),
    edges: diagram.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    })),
  });

  const positionByNodeId = new Map(
    positions.map((position) => [position.id, position.position]),
  );

  return {
    nodes: diagram.nodes.map((node) => {
      const position = positionByNodeId.get(node.id);

      return position ? { ...node, position } : node;
    }),
    edges: diagram.edges,
  };
};
