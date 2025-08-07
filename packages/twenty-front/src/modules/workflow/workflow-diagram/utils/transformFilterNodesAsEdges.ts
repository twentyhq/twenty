import {
  WorkflowDiagramEdge,
  WorkflowDiagramEdgeType,
  WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { isDefined } from 'twenty-shared/utils';

export const transformFilterNodesAsEdges = <
  T extends WorkflowDiagramNode,
  U extends WorkflowDiagramEdge,
>({
  nodes,
  edges,
  defaultFilterEdgeType,
}: {
  nodes: T[];
  edges: U[];
  defaultFilterEdgeType: WorkflowDiagramEdgeType;
}): { nodes: T[]; edges: U[] } => {
  const filterNodes = nodes.filter(
    (node) =>
      node.data.nodeType === 'action' &&
      'actionType' in node.data &&
      node.data.actionType === 'FILTER',
  );

  if (filterNodes.length === 0) {
    return { nodes, edges };
  }

  const resultNodes = nodes.filter(
    (node) => !filterNodes.some((filterNode) => filterNode.id === node.id),
  );

  const resultEdges = [...edges];
  const edgesToRemove = new Set<string>();
  const edgesToAdd: typeof edges = [];

  for (const filterNode of filterNodes) {
    const incomingEdge = edges.find((edge) => edge.target === filterNode.id);
    const outgoingEdge = edges.find((edge) => edge.source === filterNode.id);

    if (isDefined(incomingEdge) && isDefined(outgoingEdge)) {
      if (
        filterNode.data.nodeType !== 'action' ||
        filterNode.data.actionType !== 'FILTER'
      ) {
        throw new Error('Expected the filter node to be of action type');
      }

      const newEdge: U = {
        ...incomingEdge,
        type: defaultFilterEdgeType,
        id: `${incomingEdge.source}-${outgoingEdge.target}-filter-${filterNode.id}`,
        target: outgoingEdge.target,
        deletable: false,
        data: {
          ...incomingEdge.data,
          edgeType: 'filter',
          stepId: filterNode.id,
          // TODO: Get the filter settings from the filter node
          filterSettings: {},
          name: filterNode.data.name,
          runStatus: filterNode.data.runStatus,
        },
      };

      edgesToAdd.push(newEdge);
      edgesToRemove.add(incomingEdge.id);
      edgesToRemove.add(outgoingEdge.id);
    } else {
      if (isDefined(incomingEdge)) {
        edgesToRemove.add(incomingEdge.id);
      }

      if (isDefined(outgoingEdge)) {
        edgesToRemove.add(outgoingEdge.id);
      }
    }
  }

  const finalEdges = [
    ...resultEdges.filter((edge) => !edgesToRemove.has(edge.id)),
    ...edgesToAdd,
  ];

  return {
    nodes: resultNodes,
    edges: finalEdges,
  };
};
