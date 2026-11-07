import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { WorkflowStepDetail } from '@/workflow/workflow-steps/components/WorkflowStepDetail';
import { useUpdateStep } from '@/workflow/workflow-steps/hooks/useUpdateStep';
import { useUpdateTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateTrigger';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const SidePanelWorkflowEditStepContent = () => {
  const flow = useFlowOrThrow();
  const workflowSelectedNode = useAtomComponentStateValue(
    workflowSelectedNodeComponentState,
  );

  const { updateTrigger } = useUpdateTrigger();
  const { updateStep } = useUpdateStep();

  if (!isDefined(workflowSelectedNode)) {
    return null;
  }

  return (
    <StyledContainer>
      <WorkflowStepDetail
        stepId={workflowSelectedNode}
        trigger={flow.trigger}
        steps={flow.steps}
        onActionUpdate={updateStep}
        onTriggerUpdate={updateTrigger}
      />
    </StyledContainer>
  );
};
