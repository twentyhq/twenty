import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { WorkflowStepDetail } from '@/workflow/workflow-steps/components/WorkflowStepDetail';
import { useUpdateStep } from '@/workflow/workflow-steps/hooks/useUpdateStep';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
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
