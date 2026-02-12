import { SettingsLogicFunctionNewForm } from '@/settings/logic-functions/components/SettingsLogicFunctionNewForm';
import { SettingsLogicFunctionTabEnvironmentVariablesSection } from '@/settings/logic-functions/components/SettingsLogicFunctionTabEnvironmentVariablesSection';
import {
  type LogicFunctionFormValues,
  type LogicFunctionNewFormValues,
} from '@/logic-functions/hooks/useLogicFunctionUpdateFormState';

export const SettingsLogicFunctionSettingsTab = ({
  formValues,
  onChange,
}: {
  formValues: LogicFunctionFormValues;
  onChange: <TKey extends keyof LogicFunctionNewFormValues>(
    key: TKey,
  ) => (value: LogicFunctionNewFormValues[TKey]) => void;
}) => {
  return (
    <>
      <SettingsLogicFunctionNewForm
        formValues={formValues}
        onChange={onChange}
      />
      <SettingsLogicFunctionTabEnvironmentVariablesSection />
    </>
  );
};
