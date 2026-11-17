import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { computeWorkflowDiagramLayoutPositions } from '@/workflow/workflow-diagram/utils/computeWorkflowDiagramLayoutPositions';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

export const getOrganizedDiagram = (
  diagram: WorkflowDiagram,
): WorkflowDiagram => {
  const positionByNodeId = computeWorkflowDiagramLayoutPositions(diagram);

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
