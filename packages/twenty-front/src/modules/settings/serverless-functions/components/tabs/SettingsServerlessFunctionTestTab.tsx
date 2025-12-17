import { ServerlessFunctionExecutionResult } from '@/serverless-functions/components/ServerlessFunctionExecutionResult';
import { serverlessFunctionTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/serverlessFunctionTestDataFamilyState';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState } from 'recoil';
import { H2Title, IconPlayerPlay } from 'twenty-ui/display';
import { Button, CodeEditor, CoreEditorHeader } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { TextArea } from '@/ui/input/components/TextArea';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledCodeEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SettingsServerlessFunctionTestTab = ({
  handleExecute,
  serverlessFunctionId,
  isTesting = false,
}: {
  handleExecute: () => void;
  serverlessFunctionId: string;
  isTesting?: boolean;
}) => {
  const { t } = useLingui();
  const [serverlessFunctionTestData, setServerlessFunctionTestData] =
    useRecoilState(serverlessFunctionTestDataFamilyState(serverlessFunctionId));

  const onChange = (newInput: string) => {
    setServerlessFunctionTestData((prev) => ({
      ...prev,
      input: JSON.parse(newInput),
    }));
  };

  const testLogsTextAreaId = `${serverlessFunctionId}-test-logs`;

  return (
    <Section>
      <H2Title
        title={t`Test your function`}
        description={t`Insert a JSON input, then press "Run" to test your function.`}
      />
      <StyledInputsContainer>
        <StyledCodeEditorContainer>
          <CoreEditorHeader
            title={t`Input`}
            rightNodes={[
              <Button
                title={t`Run Function`}
                variant="primary"
                accent="blue"
                size="small"
                Icon={IconPlayerPlay}
                onClick={handleExecute}
                disabled={isTesting}
              />,
            ]}
          />
          <CodeEditor
            value={JSON.stringify(serverlessFunctionTestData.input, null, 4)}
            language="json"
            height={100}
            onChange={onChange}
            variant="with-header"
          />
        </StyledCodeEditorContainer>
        <ServerlessFunctionExecutionResult
          serverlessFunctionTestData={serverlessFunctionTestData}
          maxHeight={
            serverlessFunctionTestData.output.logs.length > 0 ? 200 : undefined
          }
          isTesting={isTesting}
        />
        {serverlessFunctionTestData.output.logs.length > 0 && (
          <StyledCodeEditorContainer>
            <InputLabel>{t`Logs`}</InputLabel>
            <TextArea
              textAreaId={testLogsTextAreaId}
              value={isTesting ? '' : serverlessFunctionTestData.output.logs}
              maxRows={20}
              disabled
            />
          </StyledCodeEditorContainer>
        )}
      </StyledInputsContainer>
    </Section>
  );
};
