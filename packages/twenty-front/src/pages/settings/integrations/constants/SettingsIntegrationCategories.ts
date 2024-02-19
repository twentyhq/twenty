import { SETTINGS_INTEGRATION_REQUEST_CATEGORY } from '~/pages/settings/integrations/constants/SettingsIntegrationRequest';
import { SETTINGS_INTEGRATION_WINDMILL_CATEGORY } from '~/pages/settings/integrations/constants/SettingsIntegrationWindmill';
import { SETTINGS_INTEGRATION_ZAPIER_CATEGORY } from '~/pages/settings/integrations/constants/SettingsIntegrationZapier';
import { SettingsIntegrationCategory } from '~/pages/settings/integrations/types/SettingsIntegrationCategory';

export const SETTINGS_INTEGRATION_CATEGORIES: SettingsIntegrationCategory[] = [
  SETTINGS_INTEGRATION_ZAPIER_CATEGORY,
  SETTINGS_INTEGRATION_WINDMILL_CATEGORY,
  SETTINGS_INTEGRATION_REQUEST_CATEGORY,
];
