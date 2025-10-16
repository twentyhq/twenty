import { SettingsServerlessFunctionNewForm } from '@/settings/serverless-functions/components/SettingsServerlessFunctionNewForm';
import { type ServerlessFunctionFormValues } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';

export const SettingsServerlessFunctionSettingsTab = ({
  formValues,
  onChange,
}: {
  formValues: ServerlessFunctionFormValues;
  onChange: (key: string) => (value: string) => void;
}) => {
  return (
    <SettingsServerlessFunctionNewForm
      formValues={formValues}
      onChange={onChange}
      readonly
    />
  );
};
