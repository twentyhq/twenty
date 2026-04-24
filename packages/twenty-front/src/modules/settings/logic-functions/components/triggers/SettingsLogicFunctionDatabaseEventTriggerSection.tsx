import { SettingsDatabaseEventsForm } from '@/settings/components/SettingsDatabaseEventsForm';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { type DatabaseEventTriggerSettings } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Toggle } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const DEFAULT_DATABASE_EVENT_SETTINGS: DatabaseEventTriggerSettings = {
  eventName: '*.created',
};

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

type SettingsLogicFunctionDatabaseEventTriggerSectionProps = {
  value: DatabaseEventTriggerSettings | null;
  onChange: (value: DatabaseEventTriggerSettings | null) => void;
  readonly: boolean;
};

export const SettingsLogicFunctionDatabaseEventTriggerSection = ({
  value,
  onChange,
  readonly,
}: SettingsLogicFunctionDatabaseEventTriggerSectionProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);

  const isEnabled = isDefined(value);

  if (readonly && !isEnabled) {
    return null;
  }

  const handleToggle = (checked: boolean) => {
    onChange(checked ? DEFAULT_DATABASE_EVENT_SETTINGS : null);
  };

  const [object, action] = isEnabled
    ? value.eventName.split('.')
    : ['', 'created'];

  const updateOperation = (
    _index: number,
    field: 'object' | 'action',
    fieldValue: string | null,
  ) => {
    if (!isDefined(value)) {
      return;
    }
    const nextObject = field === 'object' ? (fieldValue ?? '') : object;
    const nextAction = field === 'action' ? (fieldValue ?? action) : action;
    onChange({ ...value, eventName: `${nextObject}.${nextAction}` });
  };

  return (
    <Section>
      <StyledHeader>
        <H2Title
          title={t`Database event`}
          description={t`Triggers the function when a record changes`}
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
        <SettingsDatabaseEventsForm
          events={[
            {
              object: object || null,
              action,
              updatedFields: value.updatedFields,
            },
          ]}
          updateOperation={updateOperation}
          disabled={readonly}
        />
      )}
    </Section>
  );
};
