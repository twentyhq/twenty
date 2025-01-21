import styled from '@emotion/styled';

import { LightCopyIconButton } from '@/object-record/record-field/components/LightCopyIconButton';
import {
  DEFAULT_OUTPUT_VALUE,
  ServerlessFunctionTestData,
} from '@/workflow/states/serverlessFunctionTestDataFamilyState';
import { useTheme } from '@emotion/react';
import {
  CodeEditor,
  CoreEditorHeader,
  IconSquareRoundedCheck,
} from 'twenty-ui';
import { ServerlessFunctionExecutionStatus } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledOutput = styled.div<{ status?: ServerlessFunctionExecutionStatus }>`
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme, status }) =>
    status === ServerlessFunctionExecutionStatus.SUCCESS
      ? theme.color.turquoise
      : theme.color.red};
  display: flex;
`;

export const ServerlessFunctionExecutionResult = ({
  serverlessFunctionTestData,
}: {
  serverlessFunctionTestData: ServerlessFunctionTestData;
}) => {
  const theme = useTheme();

  const result =
    serverlessFunctionTestData.output.data ||
    serverlessFunctionTestData.output.error ||
    '';

  const leftNode =
    serverlessFunctionTestData.output.data === DEFAULT_OUTPUT_VALUE ? (
      'Output'
    ) : (
      <StyledOutput status={serverlessFunctionTestData.output.status}>
        <IconSquareRoundedCheck size={theme.icon.size.md} />
        {serverlessFunctionTestData.output.status ===
        ServerlessFunctionExecutionStatus.SUCCESS
          ? '200 OK'
          : '500 Error'}
        {' - '}
        {serverlessFunctionTestData.output.duration}ms
      </StyledOutput>
    );

  return (
    <StyledContainer>
      <CoreEditorHeader
        leftNodes={[leftNode]}
        rightNodes={[<LightCopyIconButton copyText={result} />]}
      />
      <CodeEditor
        value={result}
        language={serverlessFunctionTestData.language}
        height={serverlessFunctionTestData.height}
        options={{ readOnly: true, domReadOnly: true }}
        withHeader
      />
    </StyledContainer>
  );
};
