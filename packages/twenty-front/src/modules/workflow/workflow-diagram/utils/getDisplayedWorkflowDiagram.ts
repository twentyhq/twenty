import { getFlowPositions } from '@/workflow/utils/getFlowPositions';
import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getOrganizedDiagram } from '@/workflow/workflow-diagram/utils/getOrganizedDiagram';
import { placeUnpositionedWorkflowDiagramNodes } from '@/workflow/workflow-diagram/utils/placeUnpositionedWorkflowDiagramNodes';
import { isDefined } from 'twenty-shared/utils';

export const getDisplayedWorkflowDiagram = ({
  diagram,
  flow,
}: {
  diagram: WorkflowDiagram;
  flow: Parameters<typeof getFlowPositions>[0];
}): WorkflowDiagram => {
  if (!isDefined(flow)) {
    return diagram;
  }

  const positionedNodeIds = new Set(
    getFlowPositions(flow)
      .filter(({ position }) => isDefined(position))
      .map(({ id }) => id),
  );

  if (positionedNodeIds.size === 0) {
    return getOrganizedDiagram(diagram);
  }

  const unpositionedNodeIds = new Set(
    diagram.nodes
      .filter((node) => !positionedNodeIds.has(node.id) && !node.dragging)
      .map((node) => node.id),
  );

  return unpositionedNodeIds.size === 0
    ? diagram
    : placeUnpositionedWorkflowDiagramNodes({ diagram, unpositionedNodeIds });
};
