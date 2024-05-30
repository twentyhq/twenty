import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { SettingsSupportedFieldType } from '@/settings/data-model/types/SettingsSupportedFieldType';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getSettingsFieldTypeConfig = <T extends FieldMetadataType>(
  fieldType: T,
) =>
  (isFieldTypeSupportedInSettings(fieldType)
    ? SETTINGS_FIELD_TYPE_CONFIGS[fieldType]
    : undefined) as T extends SettingsSupportedFieldType
    ? (typeof SETTINGS_FIELD_TYPE_CONFIGS)[T]
    : undefined;
