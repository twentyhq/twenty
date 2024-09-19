import { SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const isFieldTypeSupportedInSettings = (
  fieldType: FieldMetadataType,
): fieldType is SettingsFieldType =>
  fieldType in SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS;
