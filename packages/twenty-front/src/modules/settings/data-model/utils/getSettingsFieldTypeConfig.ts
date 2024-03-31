import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getSettingsFieldTypeConfig = (fieldType: FieldMetadataType) =>
  isFieldTypeSupportedInSettings(fieldType)
    ? SETTINGS_FIELD_TYPE_CONFIGS[fieldType]
    : undefined;
