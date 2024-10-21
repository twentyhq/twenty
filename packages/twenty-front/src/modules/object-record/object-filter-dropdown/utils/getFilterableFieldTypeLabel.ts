import { FilterableFieldType } from '@/object-record/object-filter-dropdown/types/FilterableFieldType';
import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';

export const getFilterableFieldTypeLabel = (
  filterableFieldType: FilterableFieldType,
) => {
  return SETTINGS_FIELD_TYPE_CONFIGS[filterableFieldType].label;
};
