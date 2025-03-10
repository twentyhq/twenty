import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { WorkflowRunDiagramCanvas } from '@/workflow/workflow-diagram/components/WorkflowRunDiagramCanvas';
import { WorkflowVersionOutputSchemaEffect } from '@/workflow/workflow-diagram/components/WorkflowVersionOutputSchemaEffect';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared';

const StyledContainer = styled.div`
  height: 100%;
`;

export const WorkflowRunVisualizer = ({
  workflowRunId,
}: {
  workflowRunId: string;
}) => {
  const workflowRun = useWorkflowRun({ workflowRunId });
  const workflowVersion = useWorkflowVersion(workflowRun?.workflowVersionId);

  if (!isDefined(workflowRun) || !isDefined(workflowVersion)) {
    return null;
  }

  return (
    <StyledContainer>
      <WorkflowVersionOutputSchemaEffect workflowVersion={workflowVersion} />
      <WorkflowRunDiagramCanvas workflowRunStatus={workflowRun.status} />
    </StyledContainer>
  );
};
