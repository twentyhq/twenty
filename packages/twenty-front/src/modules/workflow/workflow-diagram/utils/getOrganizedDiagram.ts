import { WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import Dagre from '@dagrejs/dagre';

export const getOrganizedDiagram = (
  diagram: WorkflowDiagram,
): WorkflowDiagram => {
  const graph = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: 'TB' });

  const biggestNodeWidth = diagram.nodes.reduce(
    (acc, node) => Math.max(acc, node.measured?.width ?? 0),
    0,
  );

  diagram.edges.forEach((edge) => graph.setEdge(edge.source, edge.target));
  diagram.nodes.forEach((node) =>
    graph.setNode(node.id, {
      width: biggestNodeWidth,
      height: node.measured?.height ?? 0,
    }),
  );

  Dagre.layout(graph);

  return {
    nodes: diagram.nodes.map((node) => {
      const position = graph.node(node.id);

      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - position.width / 2;
      const y = position.y - position.height / 2;

      return { ...node, position: { x, y } };
    }),
    edges: diagram.edges,
  };
};
