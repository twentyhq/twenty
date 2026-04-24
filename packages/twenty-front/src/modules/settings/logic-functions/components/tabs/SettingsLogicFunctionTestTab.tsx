import { type LogicFunctionFormValues } from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { LogicFunctionExecutionResult } from '@/logic-functions/components/LogicFunctionExecutionResult';
import { LogicFunctionLogs } from '@/logic-functions/components/LogicFunctionLogs';
import {
  getSimulatedTriggerPayload,
  type SimulatedTriggerType,
} from '@/settings/logic-functions/utils/getSimulatedTriggerPayload';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  IconClock,
  IconDatabase,
  IconPlayerPlay,
  IconTool,
  IconWebhook,
  type IconComponent,
} from 'twenty-ui/display';
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

const buildTriggerOptions = (formValues: LogicFunctionFormValues) => {
  const options: Array<{
    label: string;
    value: SimulatedTriggerType;
    Icon: IconComponent;
  }> = [];
  if (isDefined(formValues.httpRouteTriggerSettings)) {
    options.push({ label: 'HTTP', value: 'http', Icon: IconWebhook });
  }
  if (isDefined(formValues.cronTriggerSettings)) {
    options.push({ label: 'Cron', value: 'cron', Icon: IconClock });
  }
  if (isDefined(formValues.databaseEventTriggerSettings)) {
    options.push({
      label: 'Database event',
      value: 'databaseEvent',
      Icon: IconDatabase,
    });
  }
  if (formValues.isTool) {
    options.push({ label: 'AI tool', value: 'tool', Icon: IconTool });
  }
  return options;
};

export const SettingsLogicFunctionTestTab = ({
  handleExecute,
  logicFunctionId,
  formValues,
  isTesting = false,
}: {
  handleExecute: () => void;
  logicFunctionId: string;
  formValues: LogicFunctionFormValues;
  isTesting?: boolean;
}) => {
  const { t } = useLingui();

  const { updateLogicFunctionInput, logicFunctionTestData } =
    useExecuteLogicFunction({
      logicFunctionId,
    });

  const triggerOptions = useMemo(
    () => buildTriggerOptions(formValues),
    [formValues],
  );

  const onChange = (value: string) => {
    try {
      updateLogicFunctionInput(JSON.parse(value));
    } catch {
      // ignore invalid JSON while user is still typing
    }
  };

  const handleSimulateTrigger = (triggerType: SimulatedTriggerType) => {
    updateLogicFunctionInput(
      getSimulatedTriggerPayload({
        triggerType,
        httpRouteTriggerSettings: formValues.httpRouteTriggerSettings,
        cronTriggerSettings: formValues.cronTriggerSettings,
        databaseEventTriggerSettings: formValues.databaseEventTriggerSettings,
        toolInputSchema: formValues.toolInputSchema,
      }),
    );
  };

  return (
    <Section>
      <H2Title
        title={t`Test your function`}
        description={
          triggerOptions.length > 0
            ? t`Pick a trigger to prefill a sample payload, then press "Run Function".`
            : t`Insert a JSON input, then press "Run Function" to test your function.`
        }
      />
      <StyledInputsContainer>
        {triggerOptions.length > 0 && (
          <Select<SimulatedTriggerType>
            dropdownId="logic-function-test-simulate-trigger"
            label={t`Simulate trigger`}
            fullWidth
            options={triggerOptions}
            onChange={handleSimulateTrigger}
          />
        )}
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
