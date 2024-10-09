import { WorkflowStepDetail } from '@/workflow/components/WorkflowStepDetail';
import { workflowSelectedNodeState } from '@/workflow/states/workflowSelectedNodeState';
import { WorkflowVersion } from '@/workflow/types/Workflow';
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
