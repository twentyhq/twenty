import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { WorkflowStepDetail } from '@/workflow/workflow-steps/components/WorkflowStepDetail';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const CommandMenuWorkflowViewStepContent = () => {
  const flow = useFlowOrThrow();
  const workflowSelectedNode = useRecoilComponentValueV2(
    workflowSelectedNodeComponentState,
  );

  if (!isDefined(workflowSelectedNode)) {
    return null;
  }

  return (
    <StyledContainer>
      <WorkflowStepDetail
        stepId={workflowSelectedNode}
        trigger={flow.trigger}
        steps={flow.steps}
        readonly
      />
    </StyledContainer>
  );
};
