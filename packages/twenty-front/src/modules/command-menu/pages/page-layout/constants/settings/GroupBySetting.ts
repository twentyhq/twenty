import { type ChartSettingsItem } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { IconFilters } from 'twenty-ui/display';

export const GROUP_BY_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconFilters,
  label: 'Group by',
  id: 'group-by-y',
};
