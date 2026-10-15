import { SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsNonCompositeFieldTypeConfigs';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type RecordFormFieldPlaceholders = {
  placeholder?: string;
};

const getNonCompositeExampleValue = (
  fieldType: keyof typeof SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS,
): unknown =>
  SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS[fieldType].exampleValues?.[0];

export const getRecordFormFieldPlaceholders = (
  fieldType: FieldMetadataType,
): RecordFormFieldPlaceholders => {
  switch (fieldType) {
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.UUID: {
      const exampleValue = getNonCompositeExampleValue(fieldType);

      return isDefined(exampleValue)
        ? { placeholder: String(exampleValue) }
        : {};
    }
    case FieldMetadataType.RAW_JSON: {
      const exampleValue = getNonCompositeExampleValue(fieldType);

      return isDefined(exampleValue)
        ? { placeholder: JSON.stringify(exampleValue) }
        : {};
    }
    default:
      return {};
  }
};
