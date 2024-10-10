import { SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsNonCompositeFieldTypeConfigs';
import { SettingsNonCompositeFieldType } from '@/settings/data-model/types/SettingsNonCompositeFieldType';

export const getSettingsNonCompositeFieldTypeLabel = (
  settingsNonCompositeFieldType: SettingsNonCompositeFieldType,
) => {
  return SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS[
    settingsNonCompositeFieldType
  ].label;
};
