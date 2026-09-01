import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

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
  const separatedEdges = edges.map((edge): WorkflowDiagram['edges'][number] => {
    if (!sharedTargetIds.has(edge.target)) {
      return edge;
    }

    const connectionOptions = edge.data?.sourceConnectionOptions;
    const targetHandle = encodeURIComponent(
      JSON.stringify([
        edge.source,
        edge.sourceHandle,
        connectionOptions?.connectedStepType === 'IF_ELSE'
          ? connectionOptions.settings.branchId
          : null,
      ]),
    );
    const targetHandleIds = targetHandleIdsByNode.get(edge.target) ?? [];
    targetHandleIds.push(targetHandle);
    targetHandleIdsByNode.set(edge.target, targetHandleIds);

    return {
      ...edge,
      targetHandle,
      data: {
        ...edge.data,
        edgeType: 'default',
        edgePathStrategy: 'parallel-edge',
        parallelEdgeOffset: parallelEdgeOffsets.get(edge.id),
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
