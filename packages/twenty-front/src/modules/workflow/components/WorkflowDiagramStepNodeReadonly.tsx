import { WorkflowDiagramStepNodeBase } from '@/workflow/components/WorkflowDiagramStepNodeBase';
import { WorkflowDiagramStepNodeData } from '@/workflow/types/WorkflowDiagram';

export const WorkflowDiagramStepNodeReadonly = ({
  data,
}: {
  data: WorkflowDiagramStepNodeData;
}) => {
  return <WorkflowDiagramStepNodeBase data={data} />;
};
