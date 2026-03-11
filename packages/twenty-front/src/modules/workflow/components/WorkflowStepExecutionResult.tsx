import { LightCopyIconButton } from '@/object-record/record-field/ui/components/LightCopyIconButton';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  IconLoader,
  IconSquareRoundedCheck,
  IconSquareRoundedX,
} from 'twenty-ui/display';
import { CodeEditor, CoreEditorHeader } from 'twenty-ui/input';
import { AnimatedCircleLoading } from 'twenty-ui/utilities';
import { themeCssVariables, ThemeContext } from 'twenty-ui/theme-constants';
import { useContext } from 'react';
const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledCodeEditorWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

type OutputAccent = 'default' | 'success' | 'error';

const StyledInfoContainer = styled.div`
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledOutput = styled.div<{ accent?: OutputAccent }>`
  align-items: center;
  color: ${({ accent }) =>
    accent === 'success'
      ? themeCssVariables.color.turquoise
      : accent === 'error'
        ? themeCssVariables.color.red
        : themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledStatusInfo = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
`;

export type ExecutionStatus = {
  isSuccess: boolean;
  isError: boolean;
  successMessage?: string;
  errorMessage?: string;
  additionalInfo?: string;
};

type WorkflowStepExecutionResultProps = {
  result: string;
  language: 'plaintext' | 'json';
  height?: string | number;
  status: ExecutionStatus;
  isTesting?: boolean;
  loadingMessage?: string;
  idleMessage?: string;
};

export const WorkflowStepExecutionResult = ({
  result,
  language,
  height = '100%',
  status,
  isTesting = false,
  loadingMessage = t`Processing...`,
  idleMessage = t`Output`,
}: WorkflowStepExecutionResultProps) => {
  const { theme } = useContext(ThemeContext);

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
          resizable={true}
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
