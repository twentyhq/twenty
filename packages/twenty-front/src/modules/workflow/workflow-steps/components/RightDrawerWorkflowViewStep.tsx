import { flowState } from '@/workflow/states/flowState';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { WorkflowStepDetail } from '@/workflow/workflow-steps/components/WorkflowStepDetail';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const RightDrawerWorkflowViewStep = () => {
  const flow = useRecoilValue(flowState);
  if (!isDefined(flow)) {
    throw new Error('Expected the flow to be defined');
  }

  const workflowSelectedNode = useRecoilValue(workflowSelectedNodeState);
  if (!isDefined(workflowSelectedNode)) {
    throw new Error(
      'Expected a node to be selected. Selecting a node is mandatory to edit it.',
    );
  }

  return (
    <WorkflowStepDetail
      stepId={workflowSelectedNode}
      trigger={flow.trigger}
      steps={flow.steps}
      readonly
    />
  );
};
