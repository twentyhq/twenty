import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-ui';

const StyledSourceCode = styled.pre`
  border-radius: ${({ theme }) => theme.border.radius.md};
  border: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  background-color: ${({ theme }) => theme.background.transparent.secondary};
  margin: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const WorkflowRunOutputVisualizer = ({
  workflowRunId,
}: {
  workflowRunId: string;
}) => {
  const workflowRun = useWorkflowRun({ workflowRunId });
  if (!isDefined(workflowRun)) {
    return null;
  }

  return (
    <StyledSourceCode>
      {JSON.stringify(workflowRun.output, null, 2)}
    </StyledSourceCode>
  );
};
