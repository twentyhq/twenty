import {
  SETTINGS_FIELD_TYPE_CONFIGS,
  SettingsSupportedFieldTypes,
} from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const isFieldTypeSupportedInSettings = (
  fieldType: FieldMetadataType,
): fieldType is SettingsSupportedFieldTypes =>
  fieldType in SETTINGS_FIELD_TYPE_CONFIGS;
