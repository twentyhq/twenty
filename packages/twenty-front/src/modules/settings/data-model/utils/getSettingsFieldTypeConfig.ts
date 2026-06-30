import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';

export const getSettingsFieldTypeConfig = (fieldType: SettingsFieldType) => {
  return SETTINGS_FIELD_TYPE_CONFIGS[fieldType as SettingsFieldType];
};
