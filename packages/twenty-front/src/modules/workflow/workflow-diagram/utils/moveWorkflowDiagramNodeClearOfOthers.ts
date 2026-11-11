import { type WorkflowDiagramNode } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { isDefined } from 'twenty-shared/utils';
import {
  WORKFLOW_DIAGRAM_DEFAULT_NODE_DIMENSIONS,
  WORKFLOW_LAYOUT_DEFAULT_OPTIONS,
} from 'twenty-shared/workflow';

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

const doBoxesOverlap = (
  box: WorkflowDiagramNodeBox,
  otherBox: WorkflowDiagramNodeBox,
) =>
  box.position.x < otherBox.position.x + otherBox.width &&
  otherBox.position.x < box.position.x + box.width &&
  box.position.y < otherBox.position.y + otherBox.height &&
  otherBox.position.y < box.position.y + box.height;

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

    box.position = {
      x:
        direction === 'right'
          ? blockingBox.position.x +
            blockingBox.width +
            WORKFLOW_LAYOUT_DEFAULT_OPTIONS.nodesep
          : blockingBox.position.x -
            box.width -
            WORKFLOW_LAYOUT_DEFAULT_OPTIONS.nodesep,
      y: box.position.y,
    };
  }

  return box.position;
};
