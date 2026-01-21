import { SETTINGS_INTEGRATION_NATIVE_CATEGORY } from '@/settings/integrations/constants/SettingsIntegrationsNative';
import { type SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';

export const useSettingsIntegrationCategories =
  (): SettingsIntegrationCategory[] => {
    return [SETTINGS_INTEGRATION_NATIVE_CATEGORY];
  };
