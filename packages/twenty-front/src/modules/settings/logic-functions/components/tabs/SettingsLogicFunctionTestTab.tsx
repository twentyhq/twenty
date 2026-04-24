import { type LogicFunctionFormValues } from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { LogicFunctionExecutionResult } from '@/logic-functions/components/LogicFunctionExecutionResult';
import { LogicFunctionLogs } from '@/logic-functions/components/LogicFunctionLogs';
import { useExecuteLogicFunction } from '@/logic-functions/hooks/useExecuteLogicFunction';
import {
  getSimulatedTriggerPayload,
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
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type SimulatedTrigger = {
  type: SimulatedTriggerType;
  label: string;
  description: string;
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

const StyledTriggerSummary = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledTriggerSummaryHeading = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  text-transform: uppercase;
`;

const StyledEmptyState = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px dashed ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[3]};
  text-align: center;
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

  const triggers: SimulatedTrigger[] = useMemo(() => {
    const result: SimulatedTrigger[] = [];

    if (isDefined(formValues.httpRouteTriggerSettings)) {
      const { httpMethod, path } = formValues.httpRouteTriggerSettings;
      result.push({
        type: 'http',
        label: 'HTTP',
        description: `${httpMethod} ${REACT_APP_SERVER_BASE_URL}/s${path}`,
        Icon: IconWebhook,
      });
    }
    if (isDefined(formValues.cronTriggerSettings)) {
      result.push({
        type: 'cron',
        label: 'Cron',
        description: t`Cron schedule ${formValues.cronTriggerSettings.pattern}`,
        Icon: IconClock,
      });
    }
    if (isDefined(formValues.databaseEventTriggerSettings)) {
      result.push({
        type: 'databaseEvent',
        label: 'Database event',
        description: t`Database event ${formValues.databaseEventTriggerSettings.eventName}`,
        Icon: IconDatabase,
      });
    }
    if (formValues.isTool) {
      result.push({
        type: 'tool',
        label: 'AI tool',
        description: t`Invoked by an AI agent or workflow`,
        Icon: IconTool,
      });
    }

    return result;
  }, [formValues, t]);

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

  const hasTriggers = triggers.length > 0;

  return (
    <Section>
      <H2Title
        title={t`Test your function`}
        description={
          hasTriggers
            ? t`Prefill the input with a sample payload from one of this function's triggers, then press "Run Function".`
            : t`Insert a JSON input, then press "Run Function".`
        }
      />
      <StyledInputsContainer>
        {hasTriggers ? (
          <StyledTriggerSummary>
            <StyledTriggerSummaryHeading>
              {t`Triggered by`}
            </StyledTriggerSummaryHeading>
            {triggers.map((trigger) => (
              <span key={trigger.type}>{trigger.description}</span>
            ))}
          </StyledTriggerSummary>
        ) : (
          <StyledEmptyState>
            {t`No trigger is configured for this function. Add one in the Triggers tab to test it with a realistic payload, or paste a JSON input below.`}
          </StyledEmptyState>
        )}
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
