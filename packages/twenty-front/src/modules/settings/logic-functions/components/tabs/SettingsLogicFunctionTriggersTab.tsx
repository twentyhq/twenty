import { type LogicFunctionFormValues } from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { SettingsLogicFunctionCronTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionCronTriggerSection';
import { SettingsLogicFunctionDatabaseEventTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionDatabaseEventTriggerSection';
import { SettingsLogicFunctionHttpTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionHttpTriggerSection';
import { SettingsLogicFunctionToolTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionToolTriggerSection';

export const SettingsLogicFunctionTriggersTab = ({
  formValues,
  onChange,
  readonly = false,
}: {
  formValues: LogicFunctionFormValues;
  onChange: <TKey extends keyof LogicFunctionFormValues>(
    key: TKey,
  ) => (value: LogicFunctionFormValues[TKey]) => void;
  readonly?: boolean;
}) => {
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
        isTool={formValues.isTool}
        toolInputSchema={formValues.toolInputSchema}
        onChange={onChange('isTool')}
        readonly={readonly}
      />
    </>
  );
};
