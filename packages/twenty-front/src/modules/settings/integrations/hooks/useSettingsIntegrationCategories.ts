import { SETTINGS_INTEGRATION_REQUEST_CATEGORY } from '@/settings/integrations/constants/SettingsIntegrationRequest';
import { SETTINGS_INTEGRATION_ZAPIER_CATEGORY } from '@/settings/integrations/constants/SettingsIntegrationZapier';
import { type SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';

export const useSettingsIntegrationCategories =
  (): SettingsIntegrationCategory[] => {
    return [
      SETTINGS_INTEGRATION_ZAPIER_CATEGORY,
      SETTINGS_INTEGRATION_REQUEST_CATEGORY,
    ];
  };
