import { SettingsLogicFunctionTriggerPayloadFormat } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionTriggerPayloadFormat';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { type CronTriggerSettings } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Toggle } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const DEFAULT_CRON_SETTINGS: CronTriggerSettings = {
  pattern: '0 */1 * * *',
};

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[2]};
`;

type SettingsLogicFunctionCronTriggerSectionProps = {
  value: CronTriggerSettings | null;
  onChange: (value: CronTriggerSettings | null) => void;
  readonly: boolean;
};

export const SettingsLogicFunctionCronTriggerSection = ({
  value,
  onChange,
  readonly,
}: SettingsLogicFunctionCronTriggerSectionProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);

  const isEnabled = isDefined(value);

  if (readonly && !isEnabled) {
    return null;
  }

  const handleToggle = (checked: boolean) => {
    onChange(checked ? DEFAULT_CRON_SETTINGS : null);
  };

  return (
    <Section>
      <StyledHeader>
        <H2Title
          title={t`Cron`}
          description={t`Triggers the function at regular intervals`}
        />
        {!readonly && (
          <Toggle
            value={isEnabled}
            onChange={handleToggle}
            toggleSize="small"
            color={theme.color.blue}
          />
        )}
      </StyledHeader>
      {isEnabled && (
        <>
          <SettingsTextInput
            instanceId="logic-function-cron-trigger-pattern"
            label={t`Expression`}
            placeholder="0 */1 * * *"
            value={value.pattern}
            onChange={(newPattern: string) =>
              onChange({ ...value, pattern: newPattern })
            }
            readOnly={readonly}
            fullWidth
          />
          <StyledHint>
            {t`Format: [Minute] [Hour] [Day of Month] [Month] [Day of Week]`}
          </StyledHint>
          <SettingsLogicFunctionTriggerPayloadFormat
            payload={{}}
            hint={t`Cron triggers pass no payload — the handler is called with an empty object.`}
          />
        </>
      )}
    </Section>
  );
};
