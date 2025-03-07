import { JsonTree } from '@/workflow/components/json-visualizer/components/JsonTree';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared';

const StyledContainer = styled.div`
  padding-block: ${({ theme }) => theme.spacing(4)};
  padding-inline: ${({ theme }) => theme.spacing(3)};
`;

export const WorkflowRunStepOutputDetail = ({ stepId }: { stepId: string }) => {
  const workflowRunId = useWorkflowRunIdOrThrow();
  const workflowRun = useWorkflowRun({ workflowRunId });

  if (!isDefined(workflowRun?.output?.stepsOutput)) {
    return null;
  }

  const stepOutput = workflowRun.output.stepsOutput[stepId];

  return (
    <StyledContainer>
      <JsonTree value={stepOutput} />
    </StyledContainer>
  );
};
