import { WorkflowDiagramStepNodeBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeBase';
import { WorkflowDiagramStepNodeIcon } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeIcon';
import {
  WorkflowDiagramRunStatus,
  WorkflowDiagramStepNodeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';

const getNodeVariantFromRunStatus = (
  runStatus: WorkflowDiagramRunStatus | undefined,
) => {
  switch (runStatus) {
    case 'success':
      return 'success';
    case 'failure':
      return 'failure';
    case 'running':
      return 'default';
    case 'not-executed':
      return 'not-executed';
    default:
      return 'default';
  }
};

export const WorkflowDiagramStepNodeReadonly = ({
  data,
}: {
  data: WorkflowDiagramStepNodeData;
}) => {
  return (
    <WorkflowDiagramStepNodeBase
      name={data.name}
      variant={getNodeVariantFromRunStatus(data.runStatus)}
      nodeType={data.nodeType}
      Icon={<WorkflowDiagramStepNodeIcon data={data} />}
      isLeafNode={data.isLeafNode}
    />
  );
};
