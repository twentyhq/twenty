import { WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const transformFilterNodesAsEdges = ({
  nodes,
  edges,
}: WorkflowDiagram): WorkflowDiagram => {
  // Find all FILTER nodes
  const filterNodes = nodes.filter(
    (node) =>
      node.data.nodeType === 'action' &&
      'actionType' in node.data &&
      node.data.actionType === 'FILTER',
  );

  if (filterNodes.length === 0) {
    // No filter nodes, return original diagram
    return { nodes, edges };
  }

  // Start with all non-filter nodes
  const resultNodes = nodes.filter(
    (node) => !filterNodes.some((filterNode) => filterNode.id === node.id),
  );

  // Process each filter node to create special edges
  const resultEdges = [...edges];
  const edgesToRemove = new Set<string>();
  const edgesToAdd: typeof edges = [];

  for (const filterNode of filterNodes) {
    // Find incoming edges to the filter node (A -> B)
    const incomingEdges = edges.filter((edge) => edge.target === filterNode.id);

    // Find outgoing edges from the filter node (B -> C)
    const outgoingEdges = edges.filter((edge) => edge.source === filterNode.id);

    // For each combination of incoming and outgoing edges, create a special edge
    for (const incomingEdge of incomingEdges) {
      for (const outgoingEdge of outgoingEdges) {
        // Create a special edge from A to C with filter data
        const newEdge = {
          ...incomingEdge,
          id: `${incomingEdge.source}-${outgoingEdge.target}-filter-${filterNode.id}`,
          target: outgoingEdge.target,
          data: {
            ...incomingEdge.data,
            filter: filterNode.data,
            shouldDisplayEdgeOptions: true,
          },
        };

        edgesToAdd.push(newEdge);
      }

      // Mark the original incoming edge for removal
      edgesToRemove.add(incomingEdge.id);
    }

    // Mark all outgoing edges from the filter node for removal
    for (const outgoingEdge of outgoingEdges) {
      edgesToRemove.add(outgoingEdge.id);
    }
  }

  // Filter out removed edges and add new edges
  const finalEdges = [
    ...resultEdges.filter((edge) => !edgesToRemove.has(edge.id)),
    ...edgesToAdd,
  ];

  return {
    nodes: resultNodes,
    edges: finalEdges,
  };
};
