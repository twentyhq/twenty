import { SettingsDatabaseEventsForm } from '@/settings/components/SettingsDatabaseEventsForm';
import { SettingsLogicFunctionTriggerPayloadFormat } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionTriggerPayloadFormat';
import { SettingsLogicFunctionTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionTriggerSection';
import { buildDatabaseEventPayload } from '@/settings/logic-functions/utils/getTriggerSamplePayload';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type DatabaseEventTriggerSettings } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

const DEFAULT_NEW_TRIGGER_ACTION = 'created';

const DEFAULT_DATABASE_EVENT_SETTINGS: DatabaseEventTriggerSettings[] = [
  { eventName: `*.${DEFAULT_NEW_TRIGGER_ACTION}` },
];

type SettingsLogicFunctionDatabaseEventTriggerSectionProps = {
  value: DatabaseEventTriggerSettings[] | null;
  onChange: (value: DatabaseEventTriggerSettings[] | null) => void;
  readonly: boolean;
};

const splitEventName = (eventName: string) => {
  const [object = '', action = DEFAULT_NEW_TRIGGER_ACTION] =
    eventName.split('.');

  return { object, action };
};

export const SettingsLogicFunctionDatabaseEventTriggerSection = ({
  value,
  onChange,
  readonly,
}: SettingsLogicFunctionDatabaseEventTriggerSectionProps) => {
  const { t } = useLingui();
  const [newTriggerAction, setNewTriggerAction] = useState(
    DEFAULT_NEW_TRIGGER_ACTION,
  );

  const triggers = value ?? [];

  const triggerRows = triggers.map((trigger) => {
    const { object, action } = splitEventName(trigger.eventName);

    return {
      object: object || null,
      action,
      updatedFields: trigger.updatedFields,
    };
  });

  const rows = readonly
    ? triggerRows
    : [...triggerRows, { object: null, action: newTriggerAction }];

  const updateOperation = (
    index: number,
    field: 'object' | 'action',
    fieldValue: string | null,
  ) => {
    const isNewTriggerRow = index >= triggers.length;

    if (isNewTriggerRow) {
      if (field === 'action') {
        setNewTriggerAction(fieldValue ?? DEFAULT_NEW_TRIGGER_ACTION);

        return;
      }

      if (!isDefined(fieldValue)) {
        return;
      }

      onChange([
        ...triggers,
        { eventName: `${fieldValue}.${newTriggerAction}` },
      ]);
      setNewTriggerAction(DEFAULT_NEW_TRIGGER_ACTION);

      return;
    }

    const { object, action } = splitEventName(triggers[index].eventName);
    const nextObject = field === 'object' ? (fieldValue ?? '') : object;
    const nextAction = field === 'action' ? (fieldValue ?? action) : action;

    onChange(
      triggers.map((trigger, triggerIndex) =>
        triggerIndex === index
          ? { ...trigger, eventName: `${nextObject}.${nextAction}` }
          : trigger,
      ),
    );
  };

  const removeOperation = (index: number) => {
    const remainingTriggers = triggers.filter(
      (_, triggerIndex) => triggerIndex !== index,
    );

    onChange(isNonEmptyArray(remainingTriggers) ? remainingTriggers : null);
  };

  return (
    <SettingsLogicFunctionTriggerSection
      title={t`Database event`}
      description={t`Triggers the function when a record changes. Add a row per event to listen on.`}
      enabled={isDefined(value)}
      onEnabledChange={(checked) =>
        onChange(checked ? DEFAULT_DATABASE_EVENT_SETTINGS : null)
      }
      readonly={readonly}
    >
      {isDefined(value) && (
        <>
          <SettingsDatabaseEventsForm
            events={rows}
            updateOperation={updateOperation}
            removeOperation={removeOperation}
            disabled={readonly}
          />
          {value.map((trigger, index) => (
            <SettingsLogicFunctionTriggerPayloadFormat
              key={`${trigger.eventName}-${index}`}
              label={
                value.length > 1
                  ? t`Sample input for ${trigger.eventName}`
                  : undefined
              }
              payload={buildDatabaseEventPayload(trigger)}
              hint={
                index === value.length - 1
                  ? t`Your handler receives this event object. "after" holds the new state, "before" the previous one (null for created), and "updatedFields" lists the field names that changed on update. Batch mode wraps the events in an "events" list.`
                  : undefined
              }
            />
          ))}
        </>
      )}
    </SettingsLogicFunctionTriggerSection>
  );
};
