import { CodeEditor } from '@/ui/input/code-editor/components/CodeEditor';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-ui';

const StyledSourceCodeContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  margin: ${({ theme }) => theme.spacing(4)};
  overflow: hidden;
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
