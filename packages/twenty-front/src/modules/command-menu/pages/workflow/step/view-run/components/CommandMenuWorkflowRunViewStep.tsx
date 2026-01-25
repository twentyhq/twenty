import { CommandMenuWorkflowRunViewStepContent } from '@/command-menu/pages/workflow/step/view-run/components/CommandMenuWorkflowRunViewStepContent';
import { useCommandMenuWorkflowRunIdOrThrow } from '@/command-menu/pages/workflow/step/view-run/hooks/useCommandMenuWorkflowRunIdOrThrow';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';

const StyledRightDrawerEditStep = styled.div<{
  isMobile: boolean;
}>`
  height: ${({ theme, isMobile }) => {
    const mobileOffset = isMobile ? theme.spacing(16) : '0px';

    return `calc(100% - ${mobileOffset})`;
  }};
`;

export const CommandMenuWorkflowRunViewStep = () => {
  const workflowRunId = useCommandMenuWorkflowRunIdOrThrow();
  const isMobile = useIsMobile();
  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: workflowRunId,
        }),
      }}
    >
      <StyledRightDrawerEditStep isMobile={isMobile}>
        <CommandMenuWorkflowRunViewStepContent />
      </StyledRightDrawerEditStep>
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
