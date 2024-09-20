import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { FieldType } from '@/settings/data-model/types/FieldType';
import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';

export const isFieldTypeSupportedInSettings = (
  fieldType: FieldType,
): fieldType is SettingsFieldType => fieldType in SETTINGS_FIELD_TYPE_CONFIGS;
