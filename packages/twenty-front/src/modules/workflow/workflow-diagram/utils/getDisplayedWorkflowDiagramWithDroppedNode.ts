import {
  type WorkflowDiagram,
  type WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getDisplayedWorkflowDiagram } from '@/workflow/workflow-diagram/utils/getDisplayedWorkflowDiagram';

export const getDisplayedWorkflowDiagramWithDroppedNode = ({
  diagram,
  flow,
  droppedNode,
}: {
  diagram: WorkflowDiagram;
  flow: Parameters<typeof getDisplayedWorkflowDiagram>[0]['flow'];
  droppedNode: Pick<WorkflowDiagramNode, 'id' | 'position'>;
}): WorkflowDiagram => {
  // xyflow clears `dragging` before drag stop, so the node is held at its drop position again for the nodes placed from it
  const displayedWorkflowDiagram = getDisplayedWorkflowDiagram({
    diagram: {
      ...diagram,
      nodes: diagram.nodes.map((node) =>
        node.id === droppedNode.id
          ? { ...node, position: droppedNode.position, dragging: true }
          : node,
      ),
    },
    flow,
  });

  return {
    ...displayedWorkflowDiagram,
    nodes: displayedWorkflowDiagram.nodes.map((node) =>
      node.id === droppedNode.id ? { ...node, dragging: false } : node,
    ),
  };
};
