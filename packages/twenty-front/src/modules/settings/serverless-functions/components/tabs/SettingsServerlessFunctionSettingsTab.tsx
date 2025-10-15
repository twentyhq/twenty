import { SettingsServerlessFunctionNewForm } from '@/settings/serverless-functions/components/SettingsServerlessFunctionNewForm';
import { SettingsServerlessFunctionTabEnvironmentVariablesSection } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTabEnvironmentVariablesSection';
import { type ServerlessFunctionFormValues } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';

export const SettingsServerlessFunctionSettingsTab = ({
  formValues,
  onChange,
  onCodeChange,
  serverlessFunctionId,
}: {
  formValues: ServerlessFunctionFormValues;
  serverlessFunctionId: string;
  onChange: (key: string) => (value: string) => void;
  onCodeChange: (filePath: string, value: string) => void;
}) => {
  return (
    <>
      <SettingsServerlessFunctionNewForm
        formValues={formValues}
        onChange={onChange}
        readonly
      />
      <SettingsServerlessFunctionTabEnvironmentVariablesSection
        onCodeChange={onCodeChange}
        serverlessFunctionId={serverlessFunctionId}
      />
    </>
  );
};
