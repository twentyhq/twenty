import { type LogicFunctionFormValues } from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { SettingsLogicFunctionCronTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionCronTriggerSection';
import { SettingsLogicFunctionDatabaseEventTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionDatabaseEventTriggerSection';
import { SettingsLogicFunctionHttpTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionHttpTriggerSection';
import { SettingsLogicFunctionToolTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionToolTriggerSection';
import { SettingsLogicFunctionWorkflowActionTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionWorkflowActionTriggerSection';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Callout, IconInfoCircle } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledEmptyState = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px dashed ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[4]};
  text-align: center;
`;

const StyledCalloutWrapper = styled.div`
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

export const SettingsLogicFunctionTriggersTab = ({
  formValues,
  onChange,
  readonly = false,
  applicationName,
}: {
  formValues: LogicFunctionFormValues;
  onChange: <TKey extends keyof LogicFunctionFormValues>(
    key: TKey,
  ) => (value: LogicFunctionFormValues[TKey]) => void;
  readonly?: boolean;
  applicationName?: string;
}) => {
  const { t } = useLingui();

  const hasAnyTrigger =
    isDefined(formValues.httpRouteTriggerSettings) ||
    isDefined(formValues.cronTriggerSettings) ||
    isDefined(formValues.databaseEventTriggerSettings) ||
    isDefined(formValues.toolTriggerSettings) ||
    isDefined(formValues.workflowActionTriggerSettings);

  if (readonly && !hasAnyTrigger) {
    return isDefined(applicationName) ? (
      <StyledCalloutWrapper>
        <Callout
          variant="info"
          Icon={IconInfoCircle}
          title={t`Bundled with ${applicationName}`}
          description={t`This function has no trigger configured, so it can only be invoked from the Test tab or by other functions.`}
        />
      </StyledCalloutWrapper>
    ) : (
      <StyledEmptyState>
        {t`No trigger is configured for this function.`}
      </StyledEmptyState>
    );
  }

  return (
    <>
      <SettingsLogicFunctionHttpTriggerSection
        value={formValues.httpRouteTriggerSettings}
        onChange={onChange('httpRouteTriggerSettings')}
        readonly={readonly}
      />
      <SettingsLogicFunctionCronTriggerSection
        value={formValues.cronTriggerSettings}
        onChange={onChange('cronTriggerSettings')}
        readonly={readonly}
      />
      <SettingsLogicFunctionDatabaseEventTriggerSection
        value={formValues.databaseEventTriggerSettings}
        onChange={onChange('databaseEventTriggerSettings')}
        readonly={readonly}
      />
      <SettingsLogicFunctionToolTriggerSection
        value={formValues.toolTriggerSettings}
        onChange={onChange('toolTriggerSettings')}
        readonly={readonly}
      />
      <SettingsLogicFunctionWorkflowActionTriggerSection
        value={formValues.workflowActionTriggerSettings}
        onChange={onChange('workflowActionTriggerSettings')}
        readonly={readonly}
      />
      {!readonly && !hasAnyTrigger && (
        <StyledEmptyState>
          {t`No trigger is enabled. Toggle one of the options above to choose how this function gets invoked.`}
        </StyledEmptyState>
      )}
    </>
  );
};
