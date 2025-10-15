import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { type EnvironmentVariable } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTabEnvironmentVariablesSection';

export const serverlessFunctionEnvVarFamilyState = createFamilyState<
  EnvironmentVariable[],
  string
>({
  key: 'serverlessFunctionEnvVarFamilyState',
  defaultValue: [],
});
