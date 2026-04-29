import { SettingsLogicFunctionNewForm } from '@/settings/logic-functions/components/SettingsLogicFunctionNewForm';
import { type LogicFunctionFormValues } from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';

export const SettingsLogicFunctionSettingsTab = ({
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
    <SettingsLogicFunctionNewForm
      formValues={formValues}
      onChange={onChange}
      readonly={readonly}
    />
  );
};
