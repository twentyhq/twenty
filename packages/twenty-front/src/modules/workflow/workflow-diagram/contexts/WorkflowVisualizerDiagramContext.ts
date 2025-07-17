import { StepStatus } from 'twenty-shared/workflow';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type WorkflowVisualizerDiagramContextValue = {
  openFilterInCommandMenu: (args: {
    stepName: string;
    stepId: string;
    stepExecutionStatus?: StepStatus;
  }) => void;
};

export const [
  WorkflowVisualizerDiagramContextProvider,
  useWorkflowVisualizerDiagramContextOrThrow,
] = createRequiredContext<WorkflowVisualizerDiagramContextValue>(
  'WorkflowVisualizerDiagramContext',
);
