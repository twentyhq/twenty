import { WorkflowDiagramStepNodeData } from '@/workflow/types/WorkflowDiagram';
import { WorkflowDiagramStepNodeBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeBase';

export const WorkflowDiagramStepNodeReadonly = ({
  data,
}: {
  data: WorkflowDiagramStepNodeData;
}) => {
  return <WorkflowDiagramStepNodeBase data={data} />;
};
