import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { WorkflowStepDetail } from '@/workflow/workflow-steps/components/WorkflowStepDetail';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const RightDrawerWorkflowViewStep = () => {
  const flow = useFlowOrThrow();

  const workflowSelectedNode = useRecoilValue(workflowSelectedNodeState);
  if (!isDefined(workflowSelectedNode)) {
    throw new Error(
      'Expected a node to be selected. Selecting a node is mandatory to view its details.',
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
