import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { SettingsSupportedFieldType } from '@/settings/data-model/types/SettingsSupportedFieldType';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const isFieldTypeSupportedInSettings = (
  fieldType: FieldMetadataType,
): fieldType is SettingsSupportedFieldType =>
  fieldType in SETTINGS_FIELD_TYPE_CONFIGS;
