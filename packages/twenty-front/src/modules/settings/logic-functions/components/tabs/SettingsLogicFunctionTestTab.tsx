import { LogicFunctionExecutionResult } from '@/logic-functions/components/LogicFunctionExecutionResult';
import { LogicFunctionLogs } from '@/logic-functions/components/LogicFunctionLogs';
import { type LogicFunctionFormValues } from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { useExecuteLogicFunction } from '@/logic-functions/hooks/useExecuteLogicFunction';
import {
  buildDatabaseEventPayload,
  buildHttpPayload,
  buildToolPayloadFromSchema,
  type SimulatedTriggerType,
} from '@/settings/logic-functions/utils/getSimulatedTriggerPayload';
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

type SimulatedTrigger = {
  type: SimulatedTriggerType;
  label: string;
  Icon: IconComponent;
};

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledCodeEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTriggerButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTriggerLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

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

  const {
    httpRouteTriggerSettings,
    cronTriggerSettings,
    databaseEventTriggerSettings,
    toolInputSchema,
    isTool,
  } = formValues;

  const triggers: SimulatedTrigger[] = useMemo(() => {
    const result: SimulatedTrigger[] = [];

    if (isDefined(httpRouteTriggerSettings)) {
      result.push({ type: 'http', label: t`HTTP`, Icon: IconWebhook });
    }
    if (isDefined(cronTriggerSettings)) {
      result.push({ type: 'cron', label: t`Cron`, Icon: IconClock });
    }
    if (isDefined(databaseEventTriggerSettings)) {
      result.push({
        type: 'databaseEvent',
        label: t`Database event`,
        Icon: IconDatabase,
      });
    }
    if (isTool) {
      result.push({ type: 'tool', label: t`AI tool`, Icon: IconTool });
    }

    return result;
  }, [
    httpRouteTriggerSettings,
    cronTriggerSettings,
    databaseEventTriggerSettings,
    isTool,
    t,
  ]);

  const onChange = (value: string) => {
    try {
      updateLogicFunctionInput(JSON.parse(value));
    } catch {
      // ignore invalid JSON while user is still typing
    }
  };

  const handleSimulateTrigger = (triggerType: SimulatedTriggerType) => {
    const payload = (() => {
      switch (triggerType) {
        case 'http':
          return isDefined(httpRouteTriggerSettings)
            ? buildHttpPayload(httpRouteTriggerSettings)
            : {};
        case 'cron':
          return {};
        case 'databaseEvent':
          return isDefined(databaseEventTriggerSettings)
            ? buildDatabaseEventPayload(databaseEventTriggerSettings)
            : {};
        case 'tool':
          return buildToolPayloadFromSchema(toolInputSchema);
      }
    })();
    updateLogicFunctionInput(payload);
  };

  const hasTriggers = triggers.length > 0;

  return (
    <Section>
      <H2Title
        title={t`Test your function`}
        description={t`Insert a JSON input, then press "Run Function".`}
      />
      <StyledInputsContainer>
        {hasTriggers && (
          <div>
            <StyledTriggerLabel>{t`Simulate trigger`}</StyledTriggerLabel>
            <StyledTriggerButtonRow>
              {triggers.map((trigger) => (
                <Button
                  key={trigger.type}
                  Icon={trigger.Icon}
                  title={trigger.label}
                  variant="secondary"
                  size="small"
                  onClick={() => handleSimulateTrigger(trigger.type)}
                />
              ))}
            </StyledTriggerButtonRow>
          </div>
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
