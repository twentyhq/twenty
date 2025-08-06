import { LightCopyIconButton } from '@/object-record/record-field/components/LightCopyIconButton';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  IconLoader,
  IconSquareRoundedCheck,
  IconSquareRoundedX,
} from 'twenty-ui/display';
import { CodeEditor, CoreEditorHeader } from 'twenty-ui/input';
import { AnimatedCircleLoading } from 'twenty-ui/utilities';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 200px;
`;

const StyledCodeEditorWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 200px;
`;

type OutputAccent = 'default' | 'success' | 'error';

const StyledInfoContainer = styled.div`
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledOutput = styled.div<{ accent?: OutputAccent }>`
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme, accent }) =>
    accent === 'success'
      ? theme.color.turquoise
      : accent === 'error'
        ? theme.color.red
        : theme.font.color.secondary};
  display: flex;
`;

const StyledStatusInfo = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export type ExecutionStatus = {
  isSuccess: boolean;
  isError: boolean;
  successMessage?: string;
  errorMessage?: string;
  additionalInfo?: string;
};

type WorkflowExecutionResultProps = {
  result: string;
  language: 'plaintext' | 'json';
  height?: string | number;
  status: ExecutionStatus;
  isTesting?: boolean;
  loadingMessage?: string;
  idleMessage?: string;
};

export const WorkflowExecutionResult = ({
  result,
  language,
  height = '100%',
  status,
  isTesting = false,
  loadingMessage = 'Processing...',
  idleMessage = 'Output',
}: WorkflowExecutionResultProps) => {
  const theme = useTheme();

  const SuccessLeftNode = (
    <StyledOutput accent="success">
      <IconSquareRoundedCheck size={theme.icon.size.md} />
      <div>
        <div>{status.successMessage}</div>
        {status.additionalInfo && (
          <StyledStatusInfo>{status.additionalInfo}</StyledStatusInfo>
        )}
      </div>
    </StyledOutput>
  );

  const ErrorLeftNode = (
    <StyledOutput accent="error">
      <IconSquareRoundedX size={theme.icon.size.md} />
      <div>
        <div>{status.errorMessage}</div>
        {status.additionalInfo && (
          <StyledStatusInfo>{status.additionalInfo}</StyledStatusInfo>
        )}
      </div>
    </StyledOutput>
  );

  const IdleLeftNode = idleMessage;

  const PendingLeftNode = isTesting && (
    <StyledOutput>
      <AnimatedCircleLoading>
        <IconLoader size={theme.icon.size.md} />
      </AnimatedCircleLoading>
      <StyledInfoContainer>{loadingMessage}</StyledInfoContainer>
    </StyledOutput>
  );

  const computeLeftNode = () => {
    if (isTesting) {
      return PendingLeftNode;
    }
    if (status.isError) {
      return ErrorLeftNode;
    }
    if (status.isSuccess) {
      return SuccessLeftNode;
    }
    return IdleLeftNode;
  };

  return (
    <StyledContainer>
      <CoreEditorHeader
        leftNodes={[computeLeftNode()]}
        rightNodes={[<LightCopyIconButton copyText={result} />]}
      />
      <StyledCodeEditorWrapper>
        <CodeEditor
          value={result}
          language={language}
          height={height}
          options={{ readOnly: true, domReadOnly: true }}
          isLoading={isTesting}
          variant="with-header"
        />
      </StyledCodeEditorWrapper>
    </StyledContainer>
  );
};
