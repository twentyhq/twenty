import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useWorkflowSelectedNodeOrThrow } from '@/workflow/workflow-diagram/hooks/useWorkflowSelectedNodeOrThrow';
import { WorkflowStepDetail } from '@/workflow/workflow-steps/components/WorkflowStepDetail';
import { useUpdateStep } from '@/workflow/workflow-steps/hooks/useUpdateStep';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';

export const CommandMenuWorkflowEditStepContent = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const flow = useFlowOrThrow();
  const workflowSelectedNode = useWorkflowSelectedNodeOrThrow();

  const { updateTrigger } = useUpdateWorkflowVersionTrigger({ workflow });
  const { updateStep } = useUpdateStep({
    workflow,
  });

  return (
    <WorkflowStepDetail
      stepId={workflowSelectedNode}
      trigger={flow.trigger}
      steps={flow.steps}
      onActionUpdate={updateStep}
      onTriggerUpdate={updateTrigger}
    />
  );
};
