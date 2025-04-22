import styled from '@emotion/styled';

import { LightCopyIconButton } from '@/object-record/record-field/components/LightCopyIconButton';
import { ServerlessFunctionTestData } from '@/workflow/states/serverlessFunctionTestDataFamilyState';
import { useTheme } from '@emotion/react';
import { ServerlessFunctionExecutionStatus } from '~/generated-metadata/graphql';
import { CodeEditor, CoreEditorHeader } from 'twenty-ui/input';
import {
  IconSquareRoundedCheck,
  IconSquareRoundedX,
  IconLoader,
} from 'twenty-ui/display';
import { AnimatedCircleLoading } from 'twenty-ui/utilities';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
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

export const ServerlessFunctionExecutionResult = ({
  serverlessFunctionTestData,
  isTesting = false,
}: {
  serverlessFunctionTestData: ServerlessFunctionTestData;
  isTesting?: boolean;
}) => {
  const theme = useTheme();

  const result =
    serverlessFunctionTestData.output.data ||
    serverlessFunctionTestData.output.error ||
    '';

  const SuccessLeftNode = (
    <StyledOutput accent="success">
      <IconSquareRoundedCheck size={theme.icon.size.md} />
      200 OK - {serverlessFunctionTestData.output.duration}ms
    </StyledOutput>
  );

  const ErrorLeftNode = (
    <StyledOutput accent="error">
      <IconSquareRoundedX size={theme.icon.size.md} />
      500 Error - {serverlessFunctionTestData.output.duration}ms
    </StyledOutput>
  );

  const IdleLeftNode = 'Output';

  const PendingLeftNode = isTesting && (
    <StyledOutput>
      <AnimatedCircleLoading>
        <IconLoader size={theme.icon.size.md} />
      </AnimatedCircleLoading>
      <StyledInfoContainer>Running function</StyledInfoContainer>
    </StyledOutput>
  );

  const computeLeftNode = () => {
    if (isTesting) {
      return PendingLeftNode;
    }
    if (
      serverlessFunctionTestData.output.status ===
      ServerlessFunctionExecutionStatus.ERROR
    ) {
      return ErrorLeftNode;
    }
    if (
      serverlessFunctionTestData.output.status ===
      ServerlessFunctionExecutionStatus.SUCCESS
    ) {
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
      <CodeEditor
        value={result}
        language={serverlessFunctionTestData.language}
        height={serverlessFunctionTestData.height}
        options={{ readOnly: true, domReadOnly: true }}
        isLoading={isTesting}
        variant="with-header"
      />
    </StyledContainer>
  );
};
