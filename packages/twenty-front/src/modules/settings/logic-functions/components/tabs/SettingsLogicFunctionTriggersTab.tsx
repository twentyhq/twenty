import { type LogicFunctionFormValues } from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { SettingsLogicFunctionCronTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionCronTriggerSection';
import { SettingsLogicFunctionDatabaseEventTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionDatabaseEventTriggerSection';
import { SettingsLogicFunctionHttpTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionHttpTriggerSection';
import { SettingsLogicFunctionToolTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionToolTriggerSection';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledAppNotice = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  margin-bottom: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledEmptyState = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px dashed ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[4]};
  text-align: center;
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
    formValues.isTool;

  return (
    <>
      {readonly && isDefined(applicationName) && (
        <StyledAppNotice>
          {hasAnyTrigger
            ? t`Triggers for this function are configured by the ${applicationName} application and can't be modified here.`
            : t`This function is part of the ${applicationName} application. It has no trigger configured, so it can only be invoked from the Test tab or by other functions.`}
        </StyledAppNotice>
      )}
      {readonly && !hasAnyTrigger ? (
        !isDefined(applicationName) && (
          <StyledEmptyState>
            {t`No trigger is configured for this function.`}
          </StyledEmptyState>
        )
      ) : (
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
            isTool={formValues.isTool}
            toolInputSchema={formValues.toolInputSchema}
            onChange={onChange('isTool')}
            readonly={readonly}
          />
          {!readonly && !hasAnyTrigger && (
            <StyledEmptyState>
              {t`No trigger is enabled. Toggle one of the options above to choose how this function gets invoked.`}
            </StyledEmptyState>
          )}
        </>
      )}
    </>
  );
};
