import { WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const addEdgeOptions = ({
  nodes,
  edges,
}: WorkflowDiagram): WorkflowDiagram => {
  return {
    nodes,
    edges: edges.map((edge) => ({
      ...edge,
      data: { shouldDisplayEdgeOptions: true },
    })),
  };
};
