import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { COMPOSITE_FIELD_TYPES } from '@/settings/data-model/types/CompositeFieldType';

export const isValidSubFieldName = (
  subFieldName: string,
): subFieldName is CompositeFieldSubFieldName => {
  const allSubFields = COMPOSITE_FIELD_TYPES.flatMap((compositeFieldType) =>
    SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[compositeFieldType].subFields.map(
      (subField) => subField.subFieldName,
    ),
  );

  return allSubFields.includes(subFieldName as any);
};
