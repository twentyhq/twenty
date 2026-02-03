import { LogicFunctionExecutionResult } from '@/logic-functions/components/LogicFunctionExecutionResult';
import {
  type LogicFunctionTestData,
  logicFunctionTestDataFamilyState,
} from '@/workflow/workflow-steps/workflow-actions/code-action/states/logicFunctionTestDataFamilyState';
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

export const SettingsLogicFunctionTestTab = ({
  handleExecute,
  logicFunctionId,
  isTesting = false,
}: {
  handleExecute: () => void;
  logicFunctionId: string;
  isTesting?: boolean;
}) => {
  const { t } = useLingui();
  const [logicFunctionTestData, setLogicFunctionTestData] =
    useRecoilState<LogicFunctionTestData>(
      logicFunctionTestDataFamilyState(logicFunctionId),
    );

  const onChange = (newInput: string) => {
    setLogicFunctionTestData((prev) => ({
      ...prev,
      input: JSON.parse(newInput),
    }));
  };

  const testLogsTextAreaId = `${logicFunctionId}-test-logs`;

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
            value={JSON.stringify(logicFunctionTestData.input, null, 4)}
            language="json"
            height={100}
            onChange={onChange}
            variant="with-header"
          />
        </StyledCodeEditorContainer>
        <LogicFunctionExecutionResult
          logicFunctionTestData={logicFunctionTestData}
          maxHeight={
            logicFunctionTestData.output.logs.length > 0 ? 200 : undefined
          }
          isTesting={isTesting}
        />
        {logicFunctionTestData.output.logs.length > 0 && (
          <StyledCodeEditorContainer>
            <InputLabel>{t`Logs`}</InputLabel>
            <TextArea
              textAreaId={testLogsTextAreaId}
              value={isTesting ? '' : logicFunctionTestData.output.logs}
              maxRows={20}
              disabled
            />
          </StyledCodeEditorContainer>
        )}
      </StyledInputsContainer>
    </Section>
  );
};
