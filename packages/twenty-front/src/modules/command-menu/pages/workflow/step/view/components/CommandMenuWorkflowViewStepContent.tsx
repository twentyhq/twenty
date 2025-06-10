import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { WorkflowStepContextProvider } from '@/workflow/states/context/WorkflowStepContext';
import { useWorkflowSelectedNodeOrThrow } from '@/workflow/workflow-diagram/hooks/useWorkflowSelectedNodeOrThrow';
import { WorkflowStepDetail } from '@/workflow/workflow-steps/components/WorkflowStepDetail';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const CommandMenuWorkflowViewStepContent = () => {
  const flow = useFlowOrThrow();
  const workflowSelectedNode = useWorkflowSelectedNodeOrThrow();

  return (
    <WorkflowStepContextProvider
      value={{ workflowVersionId: flow.workflowVersionId }}
    >
      <StyledContainer>
        <WorkflowStepDetail
          stepId={workflowSelectedNode}
          trigger={flow.trigger}
          steps={flow.steps}
          readonly
        />
      </StyledContainer>
    </WorkflowStepContextProvider>
  );
};
