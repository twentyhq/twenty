import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { isDefined } from 'twenty-shared/utils';
import {
  computeWorkflowLayout,
  TRIGGER_STEP_ID,
  WORKFLOW_DIAGRAM_DEFAULT_NODE_DIMENSIONS,
} from 'twenty-shared/workflow';

export const getOrganizedDiagram = (
  diagram: WorkflowDiagram,
): WorkflowDiagram => {
  const positions = computeWorkflowLayout({
    nodes: diagram.nodes.map((node) => ({
      id: node.id,
      width:
        node.measured?.width ?? WORKFLOW_DIAGRAM_DEFAULT_NODE_DIMENSIONS.width,
      height:
        node.measured?.height ??
        WORKFLOW_DIAGRAM_DEFAULT_NODE_DIMENSIONS.height,
    })),
    edges: diagram.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    })),
  });

  const positionByNodeId = new Map(
    positions.map((position) => [position.id, position.centerPosition]),
  );

  // Keeps the trigger in place when a new branch widens the layout, so the viewport does not jump
  const horizontalOffset = positionByNodeId.get(TRIGGER_STEP_ID)?.x ?? 0;

  return {
    nodes: diagram.nodes.map((node) => {
      const position = positionByNodeId.get(node.id);

      return isDefined(position) && !node.dragging
        ? {
            ...node,
            position: { x: position.x - horizontalOffset, y: position.y },
          }
        : node;
    }),
    edges: diagram.edges,
  };
};
