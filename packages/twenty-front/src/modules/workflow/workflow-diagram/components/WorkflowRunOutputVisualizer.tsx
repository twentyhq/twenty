import { useWorkflowRunUnsafe } from '@/workflow/hooks/useWorkflowRunUnsafe';
import styled from '@emotion/styled';
import { CodeEditor } from 'twenty-ui';
import { isDefined } from 'twenty-shared/utils';

const StyledSourceCodeContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(4)};
`;

export const WorkflowRunOutputVisualizer = ({
  workflowRunId,
}: {
  workflowRunId: string;
}) => {
  const workflowRun = useWorkflowRunUnsafe({ workflowRunId });

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
