import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isNonCompositeField } from '@/object-record/object-filter-dropdown/utils/isNonCompositeField';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsNonCompositeFieldTypeConfigs';
import { i18n } from '@lingui/core';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getFieldMetadataTypeLabel = (fieldType: FieldMetadataType) => {
  //TODO: Remove ?.label > .label when we have a proper type for field (issue #1097)
  if (
    isNonCompositeField(fieldType) ||
    fieldType === FieldMetadataType.RELATION
  ) {
    const label =
      SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS[
        fieldType as keyof typeof SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS
      ]?.label;

    return isDefined(label) ? i18n._(label) : undefined;
  }

  if (isCompositeFieldType(fieldType)) {
    const label = SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[fieldType]?.label;

    return isDefined(label) ? i18n._(label) : undefined;
  }
};
