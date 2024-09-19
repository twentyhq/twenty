import { FilterType } from '@/object-record/object-filter-dropdown/types/FilterType';
import { SETTINGS_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsFieldTypeConfigs';
import { isDefined } from 'twenty-ui';

export const getSubMenuHeaderTitle = (
  subMenu: FilterType | null,
): string | null => {
  if (!isDefined(subMenu)) {
    return null;
  }

  return SETTINGS_FIELD_TYPE_CONFIGS[subMenu]['label'];
};
