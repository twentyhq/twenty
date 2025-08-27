import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const selectWorkflowDiagramNode = <T extends WorkflowDiagram>({
  diagram,
  nodeIdToSelect,
}: {
  diagram: T;
  nodeIdToSelect: string;
}): T => {
  return {
    ...diagram,
    nodes: diagram.nodes.map((node) => {
      if (node.id === nodeIdToSelect) {
        return {
          ...node,
          selected: true,
        };
      }

      return node;
    }),
  };
};
