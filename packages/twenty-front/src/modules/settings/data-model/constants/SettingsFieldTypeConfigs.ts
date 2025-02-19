import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsNonCompositeFieldTypeConfigs';

export const SETTINGS_FIELD_TYPE_CONFIGS = {
  ...SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS,
  ...SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS,
};
