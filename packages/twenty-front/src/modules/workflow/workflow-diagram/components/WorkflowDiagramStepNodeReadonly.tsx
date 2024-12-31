import { WorkflowDiagramStepNodeBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeBase';
import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const WorkflowDiagramStepNodeReadonly = ({
  data,
}: {
  data: WorkflowDiagramStepNodeData;
}) => {
  return <WorkflowDiagramStepNodeBase data={data} />;
};
