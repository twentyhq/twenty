import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { WorkflowRunDiagramCanvas } from '@/workflow/workflow-diagram/components/WorkflowRunDiagramCanvas';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  height: 100%;
`;

export const WorkflowRunVisualizer = ({
  workflowRunId,
}: {
  workflowRunId: string;
}) => {
  const workflowRun = useWorkflowRun({ workflowRunId, trackUpdates: true });

  if (!isDefined(workflowRun)) {
    return null;
  }

  return (
    <StyledContainer>
      <WorkflowRunDiagramCanvas workflowRunStatus={workflowRun.status} />
    </StyledContainer>
  );
};
