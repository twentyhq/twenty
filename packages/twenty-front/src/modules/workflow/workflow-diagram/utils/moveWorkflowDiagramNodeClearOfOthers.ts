import { type WorkflowDiagramNode } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { isDefined } from 'twenty-shared/utils';
import {
  WORKFLOW_DIAGRAM_DEFAULT_NODE_DIMENSIONS,
  WORKFLOW_LAYOUT_DEFAULT_OPTIONS,
} from 'twenty-shared/workflow';

const MINIMUM_HORIZONTAL_GAP = WORKFLOW_LAYOUT_DEFAULT_OPTIONS.nodesep;

type WorkflowDiagramNodeBox = Pick<WorkflowDiagramNode, 'position'> & {
  width: number;
  height: number;
};

const getNodeBox = (
  node: Pick<WorkflowDiagramNode, 'position' | 'measured'>,
): WorkflowDiagramNodeBox => ({
  position: node.position,
  width: node.measured?.width ?? WORKFLOW_DIAGRAM_DEFAULT_NODE_DIMENSIONS.width,
  height:
    node.measured?.height ?? WORKFLOW_DIAGRAM_DEFAULT_NODE_DIMENSIONS.height,
});

// Positions are node centers, matching the canvas node origin
const doBoxesOverlap = (
  box: WorkflowDiagramNodeBox,
  otherBox: WorkflowDiagramNodeBox,
) =>
  Math.abs(box.position.x - otherBox.position.x) <
    (box.width + otherBox.width) / 2 &&
  Math.abs(box.position.y - otherBox.position.y) <
    (box.height + otherBox.height) / 2;

export const moveWorkflowDiagramNodeClearOfOthers = ({
  node,
  otherNodes,
  direction,
}: {
  node: Pick<WorkflowDiagramNode, 'id' | 'position' | 'measured'>;
  otherNodes: Pick<WorkflowDiagramNode, 'id' | 'position' | 'measured'>[];
  direction: 'left' | 'right';
}): WorkflowDiagramNode['position'] => {
  const otherBoxes = otherNodes
    .filter((otherNode) => otherNode.id !== node.id)
    .map(getNodeBox);
  const box = getNodeBox(node);

  // Each move goes past the blocking box in one direction, so no box blocks twice
  for (let attempt = 0; attempt <= otherBoxes.length; attempt++) {
    const blockingBox = otherBoxes.find((otherBox) =>
      doBoxesOverlap(box, otherBox),
    );

    if (!isDefined(blockingBox)) {
      break;
    }

    const clearance =
      (box.width + blockingBox.width) / 2 + MINIMUM_HORIZONTAL_GAP;
    const nextX =
      direction === 'right'
        ? blockingBox.position.x + clearance
        : blockingBox.position.x - clearance;

    box.position = { x: nextX, y: box.position.y };
  }

  return box.position;
};
