import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { computeWorkflowDiagramLayoutPositions } from '@/workflow/workflow-diagram/utils/computeWorkflowDiagramLayoutPositions';
import { isDefined } from 'twenty-shared/utils';

const findClosestPositionedNodeId = ({
  nodeId,
  neighbourIdsByNodeId,
  unpositionedNodeIds,
}: {
  nodeId: string;
  neighbourIdsByNodeId: Map<string, string[]>;
  unpositionedNodeIds: Set<string>;
}): string | undefined => {
  const visitedNodeIds = new Set([nodeId]);
  const nodeIdsToVisit = [nodeId];

  for (const visitedNodeId of nodeIdsToVisit) {
    for (const neighbourId of neighbourIdsByNodeId.get(visitedNodeId) ?? []) {
      if (visitedNodeIds.has(neighbourId)) {
        continue;
      }

      if (!unpositionedNodeIds.has(neighbourId)) {
        return neighbourId;
      }

      visitedNodeIds.add(neighbourId);
      nodeIdsToVisit.push(neighbourId);
    }
  }

  return undefined;
};

export const placeUnpositionedWorkflowDiagramNodes = ({
  diagram,
  unpositionedNodeIds,
}: {
  diagram: WorkflowDiagram;
  unpositionedNodeIds: Set<string>;
}): WorkflowDiagram => {
  const layoutPositionByNodeId = computeWorkflowDiagramLayoutPositions(diagram);
  const nodeById = new Map(diagram.nodes.map((node) => [node.id, node]));

  // Parents come first, so a new node is placed from the step it follows whenever that step is positioned
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

  const fallbackAnchorNodeId = diagram.nodes.find(
    (node) => !unpositionedNodeIds.has(node.id),
  )?.id;

  return {
    nodes: diagram.nodes.map((node) => {
      if (!unpositionedNodeIds.has(node.id)) {
        return node;
      }

      const anchorNodeId =
        findClosestPositionedNodeId({
          nodeId: node.id,
          neighbourIdsByNodeId,
          unpositionedNodeIds,
        }) ?? fallbackAnchorNodeId;

      const anchorNode = isDefined(anchorNodeId)
        ? nodeById.get(anchorNodeId)
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
        return node;
      }

      return {
        ...node,
        position: {
          x: anchorNode.position.x + layoutPosition.x - anchorLayoutPosition.x,
          y: anchorNode.position.y + layoutPosition.y - anchorLayoutPosition.y,
        },
      };
    }),
    edges: diagram.edges,
  };
};
