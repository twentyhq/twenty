import { i18n } from '@lingui/core';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { type FieldMetadataType } from '~/generated-metadata/graphql';

export const getFieldMetadataTypeLabel = (fieldType: FieldMetadataType) =>
  isFieldTypeSupportedInSettings(fieldType)
    ? i18n._(getSettingsFieldTypeConfig(fieldType).label)
    : undefined;
