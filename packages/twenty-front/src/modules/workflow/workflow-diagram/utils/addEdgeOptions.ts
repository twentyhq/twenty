import {
  EdgeData,
  WorkflowDiagram,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';

const DEFAULT_EDGE_DATA: EdgeData = {
  stepId: '',
};

export const addEdgeOptions = ({
  nodes,
  edges,
}: WorkflowDiagram): WorkflowDiagram => {
  return {
    nodes,
    edges: edges.map((edge) => {
      return {
        ...edge,
        data: {
          ...(edge.data ?? DEFAULT_EDGE_DATA),
          shouldDisplayEdgeOptions: true,
        },
      };
    }),
  };
};
