import {
  type WorkflowDiagram,
  type WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { computeWorkflowDiagramLayoutPositions } from '@/workflow/workflow-diagram/utils/computeWorkflowDiagramLayoutPositions';
import { moveWorkflowDiagramNodeClearOfOthers } from '@/workflow/workflow-diagram/utils/moveWorkflowDiagramNodeClearOfOthers';
import { isDefined } from 'twenty-shared/utils';

export const placeUnpositionedWorkflowDiagramNodes = ({
  diagram,
  unpositionedNodeIds,
}: {
  diagram: WorkflowDiagram;
  unpositionedNodeIds: Set<string>;
}): WorkflowDiagram => {
  const layoutPositionByNodeId = computeWorkflowDiagramLayoutPositions(diagram);

  // Parents come first, so a new node is placed from the step it follows whenever that step is placed
  const neighbourIdsByNodeId = new Map<string, string[]>();

  for (const [nodeId, neighbourId] of [
    ...diagram.edges.map((edge) => [edge.target, edge.source]),
    ...diagram.edges.map((edge) => [edge.source, edge.target]),
  ]) {
    neighbourIdsByNodeId.set(nodeId, [
      ...(neighbourIdsByNodeId.get(nodeId) ?? []),
      neighbourId,
    ]);
  }

  const placedNodeById = new Map(
    diagram.nodes
      .filter((node) => !unpositionedNodeIds.has(node.id))
      .map((node) => [node.id, node]),
  );
  const fallbackAnchorNodeId = placedNodeById.keys().next().value;

  const placeNode = ({
    node,
    anchorNodeId,
  }: {
    node: WorkflowDiagramNode;
    anchorNodeId?: string;
  }) => {
    const anchorNode = isDefined(anchorNodeId)
      ? placedNodeById.get(anchorNodeId)
      : undefined;
    const anchorLayoutPosition = isDefined(anchorNodeId)
      ? layoutPositionByNodeId.get(anchorNodeId)
      : undefined;
    const layoutPosition = layoutPositionByNodeId.get(node.id);

    if (
      !isDefined(anchorNode) ||
      !isDefined(anchorLayoutPosition) ||
      !isDefined(layoutPosition)
    ) {
      placedNodeById.set(node.id, node);
      return;
    }

    const offsetFromAnchor = {
      x: layoutPosition.x - anchorLayoutPosition.x,
      y: layoutPosition.y - anchorLayoutPosition.y,
    };

    placedNodeById.set(node.id, {
      ...node,
      position: moveWorkflowDiagramNodeClearOfOthers({
        node: {
          ...node,
          position: {
            x: anchorNode.position.x + offsetFromAnchor.x,
            y: anchorNode.position.y + offsetFromAnchor.y,
          },
        },
        otherNodes: [...placedNodeById.values()],
        direction: offsetFromAnchor.x < 0 ? 'left' : 'right',
      }),
    });
  };

  let nodesToPlace = diagram.nodes.filter((node) =>
    unpositionedNodeIds.has(node.id),
  );

  // Placing round by round lets a new node anchor on a neighbour that was itself moved aside, keeping a new branch together
  while (nodesToPlace.length > 0) {
    const anchoredNodesToPlace = nodesToPlace
      .map((node) => ({
        node,
        anchorNodeId: neighbourIdsByNodeId
          .get(node.id)
          ?.find((neighbourId) => placedNodeById.has(neighbourId)),
      }))
      .filter(({ anchorNodeId }) => isDefined(anchorNodeId));

    if (anchoredNodesToPlace.length === 0) {
      placeNode({
        node: nodesToPlace[0],
        anchorNodeId: fallbackAnchorNodeId,
      });
    }

    for (const { node, anchorNodeId } of anchoredNodesToPlace) {
      placeNode({ node, anchorNodeId });
    }

    nodesToPlace = nodesToPlace.filter((node) => !placedNodeById.has(node.id));
  }

  return {
    nodes: diagram.nodes.map((node) => placedNodeById.get(node.id) ?? node),
    edges: diagram.edges,
  };
};
