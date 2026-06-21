import {
  type WorkflowDiagram,
  type WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';

const nodePropertiesToPreserve: Array<keyof WorkflowDiagramNode> = [
  'selected',
  'measured',
];

export const mergeWorkflowDiagrams = (
  previousDiagram: WorkflowDiagram,
  nextDiagram: WorkflowDiagram,
): WorkflowDiagram => {
  const lastNodes = nextDiagram.nodes.map((nextNode) => {
    const previousNode = previousDiagram.nodes.find(
      (previousNode) => previousNode.id === nextNode.id,
    );

    const nodeWithPreservedProperties = nodePropertiesToPreserve.reduce(
      (nodeToSet, propertyToPreserve) => {
        return Object.assign(nodeToSet, {
          [propertyToPreserve]: previousNode?.[propertyToPreserve],
        });
      },
      {} as Partial<WorkflowDiagramNode>,
    );

    const mergedNode = Object.assign(nodeWithPreservedProperties, nextNode);

    if (previousNode?.dragging === true) {
      mergedNode.dragging = true;
      mergedNode.position = previousNode.position;
    }

    return mergedNode;
  });

  return {
    nodes: lastNodes,
    edges: nextDiagram.edges,
  };
};
