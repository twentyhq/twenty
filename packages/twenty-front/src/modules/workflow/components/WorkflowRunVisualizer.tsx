import { WorkflowRunVisualizerContent } from '@/workflow/components/WorkflowRunVisualizerContent';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared';

const StyledSourceCodeContainer = styled.div`
  height: 100%;
`;

export const WorkflowRunVisualizer = ({
  workflowRunId,
}: {
  workflowRunId: string;
}) => {
  const workflowRun = useWorkflowRun({ workflowRunId });
  if (!isDefined(workflowRun)) {
    return null;
  }

  return (
    <StyledSourceCodeContainer>
      <WorkflowRunVisualizerContent workflowRun={workflowRun} />
    </StyledSourceCodeContainer>
  );
};
