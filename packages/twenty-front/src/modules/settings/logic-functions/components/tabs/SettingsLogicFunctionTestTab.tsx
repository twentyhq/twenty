import { LogicFunctionExecutionResult } from '@/logic-functions/components/LogicFunctionExecutionResult';
import { LogicFunctionLogs } from '@/logic-functions/components/LogicFunctionLogs';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { H2Title, IconPlayerPlay } from 'twenty-ui/display';
import { Button, CodeEditor, CoreEditorHeader } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useExecuteLogicFunction } from '@/logic-functions/hooks/useExecuteLogicFunction';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
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

  const { updateLogicFunctionInput, logicFunctionTestData } =
    useExecuteLogicFunction({
      logicFunctionId,
    });

  const onChange = (value: string) => {
    try {
      updateLogicFunctionInput(JSON.parse(value));
    } catch {
      // ignore invalid JSON while user is still typing
    }
  };

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
            resizable
          />
        </StyledCodeEditorContainer>
        <LogicFunctionExecutionResult
          logicFunctionTestData={logicFunctionTestData}
          isTesting={isTesting}
        />
        {logicFunctionTestData.output.logs.length > 0 && (
          <StyledCodeEditorContainer>
            <LogicFunctionLogs
              componentInstanceId={`settings-logic-function-logs-${logicFunctionId}`}
              value={isTesting ? '' : logicFunctionTestData.output.logs}
            />
          </StyledCodeEditorContainer>
        )}
      </StyledInputsContainer>
    </Section>
  );
};
