import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { FieldMetadataType } from 'twenty-shared/types';

export const canBeUnique = (
  field: Pick<FieldMetadataItem, 'type' | 'isCustom'>,
) => {
  if (
    [FieldMetadataType.MORPH_RELATION, FieldMetadataType.RELATION].includes(
      field.type,
    ) ||
    (isCompositeFieldType(field.type) &&
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[field.type].subFields.every(
        (subField) => !subField.isIncludedInUniqueConstraint,
      ))
  ) {
    return false;
  }

  return true;
};
