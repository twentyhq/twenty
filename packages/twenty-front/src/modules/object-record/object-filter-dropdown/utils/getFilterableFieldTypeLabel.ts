import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { t } from '@lingui/core/macro';

export const getFilterableFieldTypeLabel = (
  filterableFieldType: FilterableFieldType,
) => {
  if (filterableFieldType === 'TS_VECTOR') {
    return t`Search`;
  }
  return SETTINGS_FIELD_TYPE_CONFIGS[filterableFieldType].label;
};
