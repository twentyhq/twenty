import {
  type WorkflowDiagram,
  type WorkflowDiagramNode,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { isDefined } from 'twenty-shared/utils';

const BASE_PROPERTIES_TO_PRESERVE: Array<keyof WorkflowDiagramNode> = [
  'selected',
  'measured',
];

export const mergeWorkflowDiagrams = (
  previousDiagram: WorkflowDiagram,
  nextDiagram: WorkflowDiagram,
  options?: { preservePositions?: boolean },
): WorkflowDiagram => {
  const propertiesToPreserve = options?.preservePositions
    ? [...BASE_PROPERTIES_TO_PRESERVE, 'position' as const]
    : BASE_PROPERTIES_TO_PRESERVE;

  const lastNodes = nextDiagram.nodes.map((nextNode) => {
    const previousNode = previousDiagram.nodes.find(
      (previousNode) => previousNode.id === nextNode.id,
    );

    if (!isDefined(previousNode)) {
      return nextNode;
    }

    const preservedProperties: Partial<WorkflowDiagramNode> = {};

    for (const property of propertiesToPreserve) {
      if (isDefined(previousNode[property])) {
        Object.assign(preservedProperties, {
          [property]: previousNode[property],
        });
      }
    }

    return { ...nextNode, ...preservedProperties };
  });

  return {
    nodes: lastNodes,
    edges: nextDiagram.edges,
  };
};
