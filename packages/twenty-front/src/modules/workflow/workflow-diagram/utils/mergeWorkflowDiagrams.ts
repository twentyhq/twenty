import {
  WorkflowDiagram,
  WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';

const nodePropertiesToPreserve: Array<keyof WorkflowDiagramNode> = ['selected'];

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

    return Object.assign(nodeWithPreservedProperties, nextNode);
  });

  return {
    nodes: lastNodes,
    edges: nextDiagram.edges,
  };
};
