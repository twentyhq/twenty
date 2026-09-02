import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { isDefined } from 'twenty-shared/utils';

const PARALLEL_EDGE_SPACING = 100;

export const separateParallelWorkflowEdges = ({
  nodes,
  edges,
}: WorkflowDiagram): WorkflowDiagram => {
  const parallelEdgesByConnection = new Map<string, typeof edges>();

  for (const edge of edges) {
    const connectionKey = JSON.stringify([edge.source, edge.target]);
    const parallelEdges = parallelEdgesByConnection.get(connectionKey) ?? [];
    parallelEdges.push(edge);
    parallelEdgesByConnection.set(connectionKey, parallelEdges);
  }

  const parallelEdgeOffsets = new Map<string, number>();
  const sharedTargetIds = new Set<string>();

  for (const parallelEdges of parallelEdgesByConnection.values()) {
    if (parallelEdges.length < 2) {
      continue;
    }

    parallelEdges.forEach((edge, index) => {
      parallelEdgeOffsets.set(
        edge.id,
        (index - (parallelEdges.length - 1) / 2) * PARALLEL_EDGE_SPACING,
      );
      sharedTargetIds.add(edge.target);
    });
  }

  const targetHandleIdsByNode = new Map<string, string[]>();
  const targetHandleOccurrences = new Map<string, number>();
  const separatedEdges = edges.map((edge): WorkflowDiagram['edges'][number] => {
    if (!sharedTargetIds.has(edge.target)) {
      return edge;
    }

    const connectionOptions = edge.data?.sourceConnectionOptions;
    const targetHandleConnection = JSON.stringify([
      edge.source,
      edge.sourceHandle,
      edge.target,
      connectionOptions?.connectedStepType === 'IF_ELSE'
        ? connectionOptions.settings.branchId
        : null,
    ]);
    const targetHandleOccurrence =
      targetHandleOccurrences.get(targetHandleConnection) ?? 0;
    targetHandleOccurrences.set(
      targetHandleConnection,
      targetHandleOccurrence + 1,
    );
    const targetHandle = encodeURIComponent(
      JSON.stringify([
        edge.source,
        edge.sourceHandle,
        connectionOptions?.connectedStepType === 'IF_ELSE'
          ? connectionOptions.settings.branchId
          : null,
        targetHandleOccurrence,
      ]),
    );
    const targetHandleIds = targetHandleIdsByNode.get(edge.target) ?? [];
    targetHandleIds.push(targetHandle);
    targetHandleIdsByNode.set(edge.target, targetHandleIds);
    const parallelEdgeOffset = parallelEdgeOffsets.get(edge.id);

    return {
      ...edge,
      targetHandle,
      data: {
        ...edge.data,
        edgeType: 'default',
        edgePathStrategy: isDefined(parallelEdgeOffset)
          ? 'parallel-edge'
          : edge.data?.edgePathStrategy,
        parallelEdgeOffset,
      },
    };
  });

  return {
    nodes: nodes.map((node) =>
      sharedTargetIds.has(node.id)
        ? {
            ...node,
            data: {
              ...node.data,
              targetHandleIds: targetHandleIdsByNode.get(node.id),
            },
          }
        : node,
    ),
    edges: separatedEdges,
  };
};
