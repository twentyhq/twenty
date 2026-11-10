import {
  type WorkflowDiagramEdge,
  type WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import {
  computeWorkflowLayout,
  WORKFLOW_DIAGRAM_DEFAULT_NODE_DIMENSIONS,
} from 'twenty-shared/workflow';

export const computeWorkflowDiagramLayoutPositions = (diagram: {
  nodes: Pick<WorkflowDiagramNode, 'id' | 'measured'>[];
  edges: Pick<WorkflowDiagramEdge, 'source' | 'target'>[];
}): Map<string, { x: number; y: number }> =>
  new Map(
    computeWorkflowLayout({
      nodes: diagram.nodes.map((node) => ({
        id: node.id,
        width:
          node.measured?.width ??
          WORKFLOW_DIAGRAM_DEFAULT_NODE_DIMENSIONS.width,
        height:
          node.measured?.height ??
          WORKFLOW_DIAGRAM_DEFAULT_NODE_DIMENSIONS.height,
      })),
      edges: diagram.edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
      })),
    }).map(({ id, centerPosition }) => [id, centerPosition]),
  );
