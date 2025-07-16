import { WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { isDefined } from 'twenty-shared/utils';

export const addEdgeOptions = ({
  nodes,
  edges,
}: WorkflowDiagram): WorkflowDiagram => {
  return {
    nodes,
    edges: edges.map((edge) => {
      if (!isDefined(edge.data)) {
        throw new Error('Edge data must be defined');
      }

      return {
        ...edge,
        data: {
          ...edge.data,
          isEdgeEditable: true,
        },
      };
    }),
  };
};
