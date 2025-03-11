import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { WorkflowStepContext } from '@/workflow/states/context/WorkflowStepContext';
import { useWorkflowSelectedNodeOrThrow } from '@/workflow/workflow-diagram/hooks/useWorkflowSelectedNodeOrThrow';
import { WorkflowStepDetail } from '@/workflow/workflow-steps/components/WorkflowStepDetail';

export const RightDrawerWorkflowViewStep = () => {
  const flow = useFlowOrThrow();
  const workflowSelectedNode = useWorkflowSelectedNodeOrThrow();

  return (
    <WorkflowStepContext.Provider
      value={{ workflowVersionId: flow.workflowVersionId }}
    >
      <WorkflowStepDetail
        stepId={workflowSelectedNode}
        trigger={flow.trigger}
        steps={flow.steps}
        readonly
      />
    </WorkflowStepContext.Provider>
  );
};
