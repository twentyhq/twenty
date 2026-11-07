import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { type canStartConnectionProviderAuthorization } from '@/settings/applications/utils/canStartConnectionProviderAuthorization';

export type AppPreferencesAppStatusApplication = {
  application: Pick<ApplicationWithPreferences['application'], 'id'>;
  connectionProviders: Parameters<
    typeof canStartConnectionProviderAuthorization
  >[0][];
  missingRequiredVariables: Pick<
    ApplicationWithPreferences['missingRequiredVariables'][number],
    'key'
  >[];
};
