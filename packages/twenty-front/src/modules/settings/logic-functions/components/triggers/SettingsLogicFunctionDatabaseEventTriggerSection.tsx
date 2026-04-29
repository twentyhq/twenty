import { SettingsDatabaseEventsForm } from '@/settings/components/SettingsDatabaseEventsForm';
import { SettingsLogicFunctionTriggerPayloadFormat } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionTriggerPayloadFormat';
import { SettingsLogicFunctionTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionTriggerSection';
import { buildDatabaseEventPayload } from '@/settings/logic-functions/utils/getTriggerSamplePayload';
import { useLingui } from '@lingui/react/macro';
import { type DatabaseEventTriggerSettings } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

const DEFAULT_DATABASE_EVENT_SETTINGS: DatabaseEventTriggerSettings = {
  eventName: '*.created',
};

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

  const [object = '', action = 'created'] = value?.eventName.split('.') ?? [];

  const updateEventNamePart = ({
    field,
    fieldValue,
  }: {
    field: 'object' | 'action';
    fieldValue: string | null;
  }) => {
    if (!isDefined(value)) return;
    const nextObject = field === 'object' ? (fieldValue ?? '') : object;
    const nextAction = field === 'action' ? (fieldValue ?? action) : action;
    onChange({ ...value, eventName: `${nextObject}.${nextAction}` });
  };

  return (
    <SettingsLogicFunctionTriggerSection
      title={t`Database event`}
      description={t`Triggers the function when a record changes`}
      enabled={isDefined(value)}
      onEnabledChange={(checked) =>
        onChange(checked ? DEFAULT_DATABASE_EVENT_SETTINGS : null)
      }
      readonly={readonly}
    >
      {isDefined(value) && (
        <>
          <SettingsDatabaseEventsForm
            events={[
              {
                object: object || null,
                action,
                updatedFields: value.updatedFields,
              },
            ]}
            updateOperation={(_, field, fieldValue) =>
              updateEventNamePart({ field, fieldValue })
            }
            removeOperation={() => onChange(null)}
            disabled={readonly}
          />
          <SettingsLogicFunctionTriggerPayloadFormat
            payload={buildDatabaseEventPayload(value)}
            hint={t`Your handler receives this event object. "after" holds the new state, "before" the previous one (null for created), and "updatedFields" lists the field names that changed on update.`}
          />
        </>
      )}
    </SettingsLogicFunctionTriggerSection>
  );
};
