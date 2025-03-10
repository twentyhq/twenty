import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { WorkflowVersionComponentInstanceContext } from '@/workflow/states/context/WorkflowVersionComponentInstanceContext';
import { useWorkflowSelectedNodeOrThrow } from '@/workflow/workflow-diagram/hooks/useWorkflowSelectedNodeOrThrow';
import { WorkflowStepDetail } from '@/workflow/workflow-steps/components/WorkflowStepDetail';

export const CommandMenuWorkflowViewStep = () => {
  const flow = useFlowOrThrow();
  const workflowSelectedNode = useWorkflowSelectedNodeOrThrow();
  return (
    <WorkflowVersionComponentInstanceContext.Provider
      value={{ instanceId: flow.workflowVersionId }}
    >
      <WorkflowStepDetail
        stepId={workflowSelectedNode}
        trigger={flow.trigger}
        steps={flow.steps}
        readonly
      />
    </WorkflowVersionComponentInstanceContext.Provider>
  );
};
