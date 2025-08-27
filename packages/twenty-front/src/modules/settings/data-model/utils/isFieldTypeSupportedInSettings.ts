import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { type FieldType } from '@/settings/data-model/types/FieldType';
import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';

export const isFieldTypeSupportedInSettings = (
  fieldType: FieldType,
): fieldType is SettingsFieldType => fieldType in SETTINGS_FIELD_TYPE_CONFIGS;
