import { useCommandMenuWorkflowIdOrThrow } from '@/command-menu/pages/workflow/hooks/useCommandMenuWorkflowIdOrThrow';
import { CommandMenuWorkflowEditStepContent } from '@/command-menu/pages/workflow/step/edit/components/CommandMenuWorkflowEditStepContent';
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

export const CommandMenuWorkflowEditStep = () => {
  const workflowId = useCommandMenuWorkflowIdOrThrow();
  const instanceId = getWorkflowVisualizerComponentInstanceId({
    recordId: workflowId,
  });
  const isMobile = useIsMobile();

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId,
      }}
    >
      <StyledRightDrawerEditStep isMobile={isMobile}>
        <CommandMenuWorkflowEditStepContent />
      </StyledRightDrawerEditStep>
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
