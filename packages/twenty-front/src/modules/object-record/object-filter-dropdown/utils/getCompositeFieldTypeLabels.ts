import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';

export const getCompositeFieldTypeLabels = (
  compositeFieldType: CompositeFieldType,
) => {
  return Object.values(
    SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[compositeFieldType].labelBySubField,
  );
};
