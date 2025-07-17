import { WorkflowDiagramEdgeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type WorkflowVisualizerDiagramContextValue = {
  openFilterInCommandMenu: (args: {
    name: string
    
  }) => void;
};

export const [
  WorkflowVisualizerDiagramContextProvider,
  useWorkflowVisualizerDiagramContextOrThrow,
] = createRequiredContext<WorkflowVisualizerDiagramContextValue>(
  'WorkflowVisualizerDiagramContext',
);
