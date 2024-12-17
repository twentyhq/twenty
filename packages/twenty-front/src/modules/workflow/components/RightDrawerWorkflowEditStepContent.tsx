import { WorkflowStepDetail } from '@/workflow/components/WorkflowStepDetail';
import { useUpdateStep } from '@/workflow/hooks/useUpdateStep';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/hooks/useUpdateWorkflowVersionTrigger';
import { workflowSelectedNodeState } from '@/workflow/states/workflowSelectedNodeState';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const RightDrawerWorkflowEditStepContent = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const workflowSelectedNode = useRecoilValue(workflowSelectedNodeState);
  if (!isDefined(workflowSelectedNode)) {
    throw new Error(
      'Expected a node to be selected. Selecting a node is mandatory to edit it.',
    );
  }

  const { updateTrigger } = useUpdateWorkflowVersionTrigger({ workflow });
  const { updateStep } = useUpdateStep({
    workflow,
  });

  return (
    <WorkflowStepDetail
      stepId={workflowSelectedNode}
      workflowVersion={workflow.currentVersion}
      onActionUpdate={updateStep}
      onTriggerUpdate={updateTrigger}
    />
  );
};
