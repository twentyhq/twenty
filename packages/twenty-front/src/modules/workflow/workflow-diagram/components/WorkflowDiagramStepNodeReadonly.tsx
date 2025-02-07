import { WorkflowDiagramStepNodeBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeBase';
import { WorkflowDiagramStepNodeIcon } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeIcon';
import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const WorkflowDiagramStepNodeReadonly = ({
  data,
}: {
  data: WorkflowDiagramStepNodeData;
}) => {
  return (
    <WorkflowDiagramStepNodeBase
      name={data.name}
      variant="default"
      nodeType={data.nodeType}
      Icon={<WorkflowDiagramStepNodeIcon data={data} />}
      isLeafNode={data.isLeafNode}
    />
  );
};
