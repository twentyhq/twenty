import { SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getSettingsFieldTypeConfig = <T extends FieldMetadataType>(
  fieldType: T,
) =>
  (isFieldTypeSupportedInSettings(fieldType)
    ? SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS[fieldType]
    : undefined) as T extends SettingsFieldType
    ? (typeof SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS)[T]
    : undefined;
