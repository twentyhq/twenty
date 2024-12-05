import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import styled from '@emotion/styled';
import { CodeEditor, isDefined } from 'twenty-ui';

const StyledSourceCodeContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(4)};
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
    <StyledSourceCodeContainer>
      <CodeEditor
        value={JSON.stringify(workflowRun.output, null, 2)}
        language="json"
        options={{ readOnly: true, domReadOnly: true }}
      />
    </StyledSourceCodeContainer>
  );
};
