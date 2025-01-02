import { WorkflowVersion } from '@/workflow/types/Workflow';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { WorkflowStepDetail } from '@/workflow/workflow-steps/components/WorkflowStepDetail';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const RightDrawerWorkflowViewStepContent = ({
  workflowVersion,
}: {
  workflowVersion: WorkflowVersion;
}) => {
  const workflowSelectedNode = useRecoilValue(workflowSelectedNodeState);
  if (!isDefined(workflowSelectedNode)) {
    throw new Error(
      'Expected a node to be selected. Selecting a node is mandatory to edit it.',
    );
  }

  return (
    <WorkflowStepDetail
      stepId={workflowSelectedNode}
      workflowVersion={workflowVersion}
      readonly
    />
  );
};
